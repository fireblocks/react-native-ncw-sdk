//
//  extensions.swift
//  react-native-ncw-sdk
//
//  Created by Amit Perelstein on 28/03/2024.
//

import Foundation

//extension Encodable {
//  func asDictionary() throws -> [String: Any] {
//    let data = try JSONEncoder().encode(self)
//    guard let dictionary = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any] else {
//      throw NSError()
//    }
//    return dictionary
//  }
//}

//
//protocol DictionaryEncodable {
//    func encode() throws -> Any
//}

extension Encodable where Self: Encodable {
    func asDictionary() throws -> Any {
        let jsonData = try JSONEncoder().encode(self)
        return try JSONSerialization.jsonObject(with: jsonData, options: .allowFragments)
    }
}

//protocol DictionaryDecodable {
//    static func decode(_ dictionary: Any) throws -> Self
//}

extension Decodable where Self: Decodable {
    static func fromDictionary(_ dictionary: Any) throws -> Self {
        let jsonData = try JSONSerialization.data(withJSONObject: dictionary, options: [])
        return try JSONDecoder().decode(Self.self, from: jsonData)
    }
}

//typealias DictionaryCodable = DictionaryEncodable & DictionaryDecodable

extension Task where Failure == Error {
    class Enclosure<T> {
         var value: T?
    }
    
    /// Performs an async task in a sync context.
    ///
    /// - Note: This function blocks the thread until the given operation is finished. The caller is responsible for managing multithreading.
    static func synchronous(priority: TaskPriority? = nil, operation: @escaping @Sendable () async throws -> Success) -> Success {
        let semaphore = DispatchSemaphore(value: 0)
        let enclosure = Enclosure<Success>()

        Task(priority: priority) {
            enclosure.value = try await operation()
            semaphore.signal()
            return enclosure.value!
        }

        semaphore.wait()
        return enclosure.value!
    }
}
