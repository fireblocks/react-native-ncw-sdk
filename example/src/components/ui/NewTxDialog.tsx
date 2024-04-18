import React from "react";
import { useAppStore } from "../../AppStore";
import { Autocomplete, IAutoCompleteItem } from "./Autocomplete";
import { INewTransactionData } from "../../IAppState";
import { Modal, View, Text, Switch, Button, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";

interface IProps {
  isOpen: boolean;
  assetsToSelectFrom: IAutoCompleteItem[];
  onClose: () => void;
}

export const NewTxDialog: React.FC<IProps> = ({ isOpen, onClose, assetsToSelectFrom }) => {
  const { createTransaction, deviceId } = useAppStore();
  const [assetIdPrompt, setAssetIdPrompt] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [destinationAddress, setDestinationAddress] = React.useState<string>("");
  const [txType, setTXType] = React.useState<"transfer" | "typed-message">("typed-message");
  const [txFee, setTXFee] = React.useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [txTypeOpen, setTxTypeOpen] = React.useState(false);

  const clearForm = () => {
    setAmount("");
    setDestinationAddress("");
    setTXFee("LOW");
  };

  const closeDialog = () => {
    setTXType("transfer");
    clearForm();
    onClose();
  };

  const onCreateTransactionClicked = async () => {

    let dataToSend: INewTransactionData = {
      note: `API Transaction by ${deviceId}`,
      accountId: "0",
      assetId: assetIdPrompt,
    }

    if (txType === "transfer") {
      dataToSend = {
        ...dataToSend,
        amount: amount,
        destAddress: destinationAddress,
        feeLevel: txFee,
        estimateFee: false,
      };
    }

    await createTransaction(dataToSend);
    closeDialog();
  };

  const isValidForm = () => {
    if (txType === "transfer") {
      return assetIdPrompt && amount && destinationAddress && txFee;
    }

    if (txType === "typed-message") {
      return !!assetIdPrompt;
    }

    return false;
  };

  const selectedAsset = assetsToSelectFrom?.find((asset) => asset.id === assetIdPrompt);

  return (
    <Modal visible={isOpen} onDismiss={onClose}>
      <AutocompleteDropdownContextProvider>
        <View>
          <Text>New Tx</Text>
          <View>
            <View>
              <Text>Current device id</Text>
              <Text>{deviceId}</Text>
            </View>
            <View>
              <Text>Which type of transaction you want to create?</Text>
              <View>
                <DropDownPicker
                  open={txTypeOpen}
                  setOpen={setTxTypeOpen}
                  setValue={setTXType}
                  onChangeValue={clearForm}
                  value={txType}
                  items={[{ label: "Transfer", value: "transfer" }, { label: "Typed message", value: "typed-message" }]}
                ></DropDownPicker>
                <View>
                </View>
                <Text>Select Asset</Text>
                <View>
                  <AutocompleteDropdown
                    onSelectItem={item => {
                      setAssetIdPrompt(item?.id ?? "")
                    }}
                    onClear={() => setAssetIdPrompt("")}
                    dataSet={assetsToSelectFrom.map(({ id, name }) => ({ id, title: name }))}
                  />
                </View>
              </View>
              {assetIdPrompt && txType === "transfer" && (
                <View>
                  <View>
                    <Text>Amount</Text>
                    <Text>{`Max: ${selectedAsset?.balance}`}</Text>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Amount"
                    />
                  </View>
                  <View>
                    <Text>Destination address</Text>
                    <TextInput
                      value={destinationAddress}
                      onChangeText={setDestinationAddress}
                      placeholder="Destination address"
                    />
                  </View>
                  <View>
                    <Text>Select fee level</Text>
                    <View>
                      <View>
                        <Switch
                          value={txFee === "LOW"}
                          onValueChange={(v) => { if (v) {setTXFee("LOW") }}}
                        />
                        <Text>Low</Text>
                      </View>
                      <View>
                        <Switch
                          value={txFee === "MEDIUM"}
                          onValueChange={(v) => { if (v) {setTXFee("MEDIUM") }}}
                        />
                        <Text>Medium</Text>
                      </View>
                      <View>
                        <Switch
                          value={txFee === "HIGH"}
                          onValueChange={(v) => { if (v) {setTXFee("HIGH") }}}
                        />
                        <Text>High</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              <Button title="Create" onPress={onCreateTransactionClicked} disabled={!isValidForm()} />
              <Button title="Cancel" onPress={closeDialog} />
            </View>
          </View>
        </View>
      </AutocompleteDropdownContextProvider>
    </Modal>
  );
};
