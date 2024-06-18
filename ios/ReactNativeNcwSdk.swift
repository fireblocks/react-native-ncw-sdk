//
//  ReactNativeNcwSdk.swift
//  react-native-ncw-sdk
//
//  Created by Amit Perelstein on 20/03/2024.
//

import Foundation
// dev9:
import FireblocksDev 
// sandbox:
// import FireblocksSDK
import React

struct BridgeError: LocalizedError {
    let description: String

    init(_ description: String) {
        self.description = description
    }

    var errorDescription: String? {
        description
    }
}

class DeviceAdapter : KeyStorageDelegate, MessageHandlerDelegate, EventHandlerDelegate, FireblocksPassphraseResolver, FireblocksJoinWalletHandler {
    
    private(set) var deviceId: String

    private var currentOpId: Int32 = 0
    private var pendingOps: [Int32 : (NSDictionary) -> ()] = [:]

    init(deviceId: String) {
        self.deviceId = deviceId
    }
    
    func handleResponse(response: NSDictionary) {
        guard let opId = response["opId"] as! Int32? else {
            print("failed to get opId from response")
            return
        }
        
        let cb = self.pendingOps.removeValue(forKey: opId)
        if (cb != nil) {
            print("invoking callback response for opId", opId)
            DispatchQueue.global(qos: .userInteractive).async {
                cb!(response)
            }
        }
    }
    
    private func sendOperation(eventName: String, params: [ String : Any ], responseHandler: @escaping (NSDictionary) -> ()) {
        let op: Int32 = self.currentOpId
        self.currentOpId+=1
        self.pendingOps[op] = responseHandler
        
        var reqBody = params
        reqBody["deviceId"] = self.deviceId
        reqBody["opId"] = op
        
        ReactNativeNcwSdk.emitter.sendEvent(withName: eventName, body: reqBody)
    }
    
    // FireblocksJoinWalletHandler
    func onRequestId(requestId: String) {
        ReactNativeNcwSdk.emitter.sendEvent(withName: "joinWalletRequest", body: [
            "deviceId": deviceId,
            "requestId": requestId ])
    }
    
    // FireblocksJoinWalletHandler
    func onProvisionerFound() {
        ReactNativeNcwSdk.emitter.sendEvent(withName: "provisionerFound", body: [
            "deviceId": deviceId ])
    }
    
    // FireblocksPassphraseResolver
    func resolve(passphraseId: String, callback: @escaping (String) -> ()) {
        sendOperation(eventName: "resolvePassphrase", params: [ "passphraseId": passphraseId ], responseHandler: { (dict: NSDictionary) -> () in
            print ("resolved passphrase", dict)
            guard let passphrase = dict["data"] as! String? else {
                print("unexpected type")
                callback("")
                return
            }
            
            print ("calling back resolved pass")
            callback(passphrase)
        })
    }
    
    // EventHandlerDelegate

    //dev9: event: FireblocksDev.FireblocksEvent 
    //sandbox: event: FireblocksSDK.FireblocksEvent

    func onEvent(event: FireblocksDev.FireblocksEvent) {
        func emitSDKEvent(body: [String: Any]) {
            ReactNativeNcwSdk.emitter.sendEvent(withName: "sdk_event", body: body)
        }
        do {
            switch event {
            case let .KeyCreation(status, error):
                print("DeviceDelegateAdapter, status(.KeyCreation): \(status.description()). Error: \(String(describing: error)).")
                emitSDKEvent(body: [ "type": "key_descriptor_changed", "keyDescriptor": try status.asDictionary()])
                break
            case let .Backup(status, error):
                print("DeviceDelegateAdapter, status(.Backup): \(status.description()). Error: \(String(describing: error)).")
                // TODO: array of single element? can the event support multiple keys?
                emitSDKEvent(body: [ "type": "keys_backup", "keysBackup": [try status.asDictionary()] ])
                break
            case let .Recover(status, error):
                print("DeviceDelegateAdapter, status(.Recover): \(String(describing: status?.description())). Error: \(String(describing: error)).")
                emitSDKEvent(body: [ "type": "keys_recovery", "keyDescriptor": try status.asDictionary() ])
                break
            case let .Transaction(status, error):
                print("DeviceDelegateAdapter, status(.Transaction): \(status.description()). Error: \(String(describing: error)).")
                emitSDKEvent(body: [ "type": "transaction_signature_changed", "transactionSignature": [ "txId": status.txId, "transactionSignatureStatus": status.transactionSignatureStatus.rawValue  ] ])
                break
            case let .Takeover(status, error):
                print("DeviceDelegateAdapter, status(.Takeover): \(status.description()). Error: \(String(describing: error)).")
                emitSDKEvent(body: [ "type": "key_takeover_changed", "keyTakeover": try status.asDictionary() ])
                break
            case let .JoinWallet(status, error):
                print("DeviceDelegateAdapter, status(.JoinWallet): \(status.description()). Error: \(String(describing: error)).")
                emitSDKEvent(body: [ "type": "join_wallet_descriptor", "joinWalletDescriptor": try status.asDictionary() ])
                break
            @unknown default:
                fatalError()
            }
        } catch let err {
            print ("failed to emit event", event, err)
        }
    }
    
    // KeyStorageDelegate
    func store(keys: [String : Data], callback: @escaping ([String : Bool]) -> ()) {
        print("calling store")
        let encodedKeys = keys.mapValues { $0.base64EncodedString() }

        sendOperation(eventName: "store", params: [ "map": encodedKeys ], responseHandler: { (dict: NSDictionary) -> () in
            print("received store response cb", dict)
            
            guard let data = dict["data"] as! [String : Bool]? else {
                print("unexpected type")
                callback(keys.mapValues { _ in false })
                return
            }
            
            print("calling response cb", data)
            callback(data)
        })
    }
    
    // KeyStorageDelegate
    func load(keyIds: Set<String>, callback: @escaping ([String : Data]) -> ()) {
        print("calling load")
        
        sendOperation(eventName: "load", params: [ "keys": Array(keyIds) ], responseHandler: { (dict: NSDictionary) -> () in
            print("received load response cb", dict)
            
            guard let data = dict["data"] as! [String: String]? else {
                print("unexpected type during load")
                callback([:])
                return
            }
            
            var response: [String: Data] = [:]
            for (k,v) in data {
                let b = Data(base64Encoded: v)
                if (b != nil) {
                    response[k] = b
                }
            }
            
            callback(response)
        })
    }
    
    // KeyStorageDelegate
    func remove(keyId: String) {
        print("calling remove")

        sendOperation(eventName: "remove", params: [ "keys": Array(keyId) ], responseHandler: { (dict: NSDictionary) -> () in
            print("received remove response cb", dict)
            
            guard let data = dict["data"] as! [String: Bool]? else {
                print("unexpected type during load")
                return
            }
            
            // no callback handler
        })
    }
    
    // KeyStorageDelegate
    func contains(keyIds: Set<String>, callback: @escaping ([String : Bool]) -> ()) {
        print("calling contains")

        sendOperation(eventName: "remove", params: [ "keys": Array(keyIds) ], responseHandler: { (dict: NSDictionary) -> () in
            print("received remove response cb", dict)
            
            guard let data = dict["data"] as! [String: Bool]? else {
                print("unexpected type during load")
                callback([:])
                return
            }
            
            callback(data)
        })
        
        ReactNativeNcwSdk.emitter.sendEvent(withName: "contains", body: [])
    }
    
    // MessageHandlerDelegate
    func handleOutgoingMessage(payload: String, response: @escaping (String?) -> (), error: @escaping (String?) -> ()) {
        print("Emitting handleOutgoingMessage, deiviceId:", deviceId)
        
        sendOperation(eventName: "outgoingMessage", params: [ "message": payload ], responseHandler: { (dict: NSDictionary) -> () in
            guard let data = dict["data"] as! String? else {
                error("failed to get data")
                return
            }
            response(data)
        })
    }
}


@objc(ReactNativeNcwSdk)
class ReactNativeNcwSdk : RCTEventEmitter {
    
    public static var emitter: RCTEventEmitter!
    private static var adapters: [String : DeviceAdapter] = [:]

    override init() {
      super.init()
        ReactNativeNcwSdk.emitter = self
    }
      
    open override func supportedEvents() -> [String] {
      [  "store", "load", "contains", "remove", "outgoingMessage", "sdk_event", "resolvePassphrase", "joinWalletRequest", "provisionerFound" ]
    }
    
    
    override open class func requiresMainQueueSetup() -> Bool {
      return false
    }
    
    @objc
    func getPhysicalDeviceId() -> String {
        return Fireblocks.getPhysicalDeviceId()
    }
    
    @objc
    func generateDeviceId(_ callback: RCTResponseSenderBlock) {
        callback([Fireblocks.generateDeviceId()])
    }
    
    @objc
    func handleResponse(_ response: NSDictionary,
                        withResolve resolve: RCTPromiseResolveBlock,
                        withReject reject: RCTPromiseRejectBlock) {
        print("handleResponse called", response)
        
        guard let deviceId = response["deviceId"] as! String? else {
            reject("deviceId", "missing param", BridgeError("Missing deviceId"))
            return
        }
        
        if ReactNativeNcwSdk.adapters.contains(where: { $0.key == deviceId }) {
            ReactNativeNcwSdk.adapters[deviceId]?.handleResponse(response: response)
        }
        
        resolve("ok")
    }
    
    @objc
    func initialize(_ deviceId: String, withEnv env: String, withResolve resolve: RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        do {
            if ReactNativeNcwSdk.adapters.contains(where: { $0.key == deviceId }) {
                print("already initialized, deviceId:", deviceId)
                resolve(nil)
                return
            }
            
            print("initializing Fireblocks, deiviceId:", deviceId)
            let adapter = DeviceAdapter(deviceId: deviceId)
            // dev9:
            let opts: FireblocksOptions = FireblocksOptions(env: FireblocksDev.FireblocksEnvironment(rawValue: env)!, eventHandlerDelegate: adapter, logLevel: .debug)
            // sandbox:
            // let opts: FireblocksOptions = FireblocksOptions(env: FireblocksSDK.FireblocksEnvironment(rawValue: env)!, eventHandlerDelegate: adapter, logLevel: .debug)
            try Fireblocks.initialize(deviceId: deviceId, messageHandlerDelegate: adapter, keyStorageDelegate: adapter, fireblocksOptions: opts)
            
            print("initialized Fireblocks successfully, deiviceId:", deviceId)
            
            ReactNativeNcwSdk.adapters[deviceId] = adapter
            resolve(nil)
        } catch let err {
            reject("error", "failed to init", err)
        }
    }
    
    @objc func getURLForLogFiles(_ deviceId: String, withResolve resolve: RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            let url = instance.getURLForLogFiles()
            resolve(url?.absoluteString)
        } catch let err {
            reject("error", "failed to get url for log file", err)
        }
    }
    
    // TODO: deprecated - remove?
    @objc func sendLogs(_ deviceId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            instance.sendLogs(callback: { (success: Bool) -> () in resolve(["success": success]) })
        } catch let err {
            reject("error", "failed to send logs", err)
        }
    }
    
    @objc func getKeysStatus(_ deviceId: String, withResolve resolve: RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            let status = instance.getKeysStatus()
            var response: [String: Any] = [:]
            for key in status {
                if let algorithm = key.algorithm?.rawValue {
                    response[algorithm] = try key.asDictionary()
                }
            }
            resolve(response)
        } catch let err {
            reject("error", "failed to send logs", err)
        }
    }
    
    @objc func generateMPCKeys(_ deviceId: String, withAlgorithms algorithms: [String], withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        do {
            // TODO: throw on nils or is this enough?
            let algs = Set(algorithms.compactMap { Algorithm(rawValue: $0) })
            
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            try instance.generateMPCKeys(algorithms: algs, callback: { (keys: Set<KeyDescriptor>) -> () in resolve(Array(keys)) })
        } catch let err {
            reject("error", "failed to send logs", err)
        }
    }
    
    @objc func signTransaction(_ deviceId: String, withTxId txId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            
            try instance.signTransaction(txId: txId, callback: { (signature: TransactionSignature) -> () in
                resolve([ "signature": signature ]) })
        } catch let err {
            reject("error", "failed to send logs", err)
        }
    }
    
    @objc func backupKeys(_ deviceId: String, withPassphrase passphrase: String, withPassphraseId passphraseId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: RCTPromiseRejectBlock) {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            
            try instance.backupKeys(passphrase: passphrase, passphraseId: passphraseId, callback: {(status: Set<KeyBackup>) -> () in
                                resolve(Array(status))
            })
        } catch let err {
            reject("error", "failed to send logs", err)
        }
    }
    
    @objc func recoverKeys(_ deviceId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: @escaping RCTPromiseRejectBlock) {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            let adapter = ReactNativeNcwSdk.adapters[deviceId]!

            try instance.recoverKeys(passphraseResolver: adapter, callback: { (keys: Set<KeyRecovery>) -> () in
                do {
                    try resolve((keys.map { try $0.asDictionary() }))
                }
                catch let err {
                    reject("error", "failed to translate recoverKeys response", err)
                }
            })
        } catch let err {
            reject("error", "failed to send logs", err)
        }
    }
    
    @objc func takeover(_ deviceId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: @escaping RCTPromiseRejectBlock) {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            try instance.takeover(callback: { (keys: Set<FullKey>) -> () in
                do {
                    try resolve(keys.map { try $0.asDictionary() })
                }
                catch let err {
                    reject("error", "failed to translate takeover response", err)
                }
            })
        } catch let err {
            reject("error", "failed to takeover", err)
        }
    }
    
    @objc func deriveAssetKey(_ deviceId: String, withExtendedPrivateKey extendedPrivateKey: String, withBip44DerivationParams bip44DerivationParams: Dictionary<String, Int>) -> String {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            let adapter = ReactNativeNcwSdk.adapters[deviceId]!
            
            // TODO: ask dudi to make DerivationParams Codebale and parse with extension?
            // TODO: input validation?
            let params = DerivationParams(
                coinType: bip44DerivationParams["coinType"]!,
                account: bip44DerivationParams["account"]!,
                change: bip44DerivationParams["change"]!,
                index: bip44DerivationParams["index"]!
            )
            
            // TODO: ask dudi if sdk can be synchronous api
            return Task.synchronous {
                let key = try await instance.deriveAssetKey(
                    extendedPrivateKey: extendedPrivateKey,
                    bip44DerivationParams: params)
                
                return key.data ?? ""
            }
        } catch let err {
            return ""
        }
    }
    
    @objc func requestJoinExistingWallet(_ deviceId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: @escaping RCTPromiseRejectBlock) {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            let adapter = ReactNativeNcwSdk.adapters[deviceId]!
            
            try instance.requestJoinExistingWallet(joinWalletHandler: adapter, callback: { (keys: Set<KeyDescriptor>) -> () in
                do {
                    resolve(try keys.map { try $0.asDictionary() })
                } catch let err {
                    reject("error", "failed to request join existing wallet", err)
                }
            })
        }  catch let err {
            reject("error", "failed to request join existing wallet", err)
        }
    }
    
    @objc func stopJoinWallet(_ deviceId: String) {
        do {
            let instance = try Fireblocks.getInstance(deviceId: deviceId)
            let adapter = ReactNativeNcwSdk.adapters[deviceId]!
            
            try instance.stopJoinWallet()
        }  catch let err {
            print("failed to stop join wallet", err)
        }
    }
    
    @objc func approveJoinWalletRequest(_ deviceId: String, withRequestId requestId: String, withResolve resolve: @escaping RCTPromiseResolveBlock, withReject reject: @escaping RCTPromiseRejectBlock) {
            do {
                let instance = try Fireblocks.getInstance(deviceId: deviceId)
                let adapter = ReactNativeNcwSdk.adapters[deviceId]!
                
                try instance.approveJoinWalletRequest(requestId: requestId, callback: { (desc: Set<JoinWalletDescriptor>) -> () in
                    do {
                        resolve(try desc.map { try $0.asDictionary() })
                    } catch let err {
                        reject("error", "failed to approve join wallet request", err)
                    }
                })
            }  catch let err {
                reject("error", "failed to approve join wallet request", err)
            }
        }
}



