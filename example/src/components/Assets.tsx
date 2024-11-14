import React, { useRef } from "react";
import { useAppStore } from "../AppStore";
// import { Autocomplete } from "./ui/Autocomplete";
import { Card } from "./ui/Card";
import { IActionButtonProps } from "./ui/ActionButton";
import { Row, Table } from "react-native-reanimated-table";
import { Button, Text, View } from "react-native";
import { AutocompleteDropdown, AutocompleteDropdownRef } from "react-native-autocomplete-dropdown";
import { SvgUri } from "react-native-svg";
import { Copyable } from "./ui/Copyable";

export const Assets: React.FC = () => {
  const { accounts, refreshAccounts, addAsset, refreshSupportedAssets, supportedAssets } = useAppStore();
  const [assetIdPrompt, setAssetIdPrompt] = React.useState<string | null>(null);
  const [isAddingAsset, setIsAddingAsset] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const dropdownController = useRef<AutocompleteDropdownRef>();

  const onAddAssetClicked = async () => {
    if (!assetIdPrompt) {
      return;
    }

    setIsAddingAsset(true);
    try {
      await addAsset(0, assetIdPrompt);
    } finally {
      setIsAddingAsset(false);
      setAssetIdPrompt(null);
      dropdownController.current?.clear();
    }
    await refreshAccounts();
    await refreshSupportedAssets(0);
  };

  const onRefreshClicked = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccounts();
      await refreshSupportedAssets(0);
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasAccounts = accounts.length > 0;

  React.useEffect(() => {
    async function fetchAssets() {
      try {
        await refreshAccounts();
        await refreshSupportedAssets(0);
      } catch (e) { }
    }
    fetchAssets();
  }, []);

  const refreshAction: IActionButtonProps = {
    action: onRefreshClicked,
    label: "Refresh",
    isDisabled: isRefreshing,
  };

  // <label>Account #{index}</label>
  return (
    <Card title="Assets" actions={[refreshAction]}>
      {hasAccounts &&
        accounts.map((account, index) => (
          <View key={`asset_account_${index}`}>
          <Table key={`account${index}`}>
              <Row data={[
                "Asset",
                "Name",
                "Address",
                "Balance"
              ]} />
              {Object.entries(account).map(([assetId, assetInfo]) => (
                <React.Fragment key={`asset_account_row_${index}_${assetId}`}>
                  <Row data={[
                  assetId,
                  assetInfo.asset.name,
                  <Copyable value={assetInfo.address?.address ?? ""} />,
                  <Text style={{ textAlign: 'center' }}>{assetInfo.balance?.total}</Text>
                  ]} />
                </React.Fragment>
              ))}
            </Table>
            <View style={{
              justifyContent: "space-between",
              alignItems: 'center',
              flexWrap: 'wrap',
              flexDirection: "row",
              paddingTop: 10,
            }}>
              <AutocompleteDropdown
                controller={controller => {
                  dropdownController.current = controller
                }}
                containerStyle={{
                  flex: 3,
                  paddingRight: 10,
                }}

                onSelectItem={item => {
                  setAssetIdPrompt(item?.id ?? null)
                }}
                dataSet={supportedAssets[index] ? Object.values(supportedAssets[index]).map(({ id, name }) => ({ id, title: name })) : []}
              // renderItem={(item) => <Text style={{ color: '#fff', padding: 15 }}>{item.title}</Text> }
              // renderItem={(item) => <SvgUri uri={accounts[index][item.id].asset.iconUrl ?? null}></SvgUri> }
              />
              <View style={{ flex: 1 }}>
                <Button title="Add" onPress={onAddAssetClicked} disabled={isAddingAsset || !assetIdPrompt || assetIdPrompt.trim().length === 0}></Button>
              </View>
            </View>
          </View>
        ))}
    </Card>
  );
};
