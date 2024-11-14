import React from "react";
import { useAppStore } from "../AppStore";
import { IWalletAsset } from "../services/ApiService";
import { Copyable } from "./ui/Copyable";
import { missingIcon } from "../icons/missingIcon";
import { Row, Table } from "react-native-reanimated-table";

interface IAssetListItem {
  coinType: number;
  accountId: number;
  addressIndex: number;
  derivedAssetKey: string;
  derivationPathStr: string;
  assetId: string;
  id: string;
  name: string;
  iconUrl?: string;
}

interface IProps {
  privateKey: string;
}

export const DeriveAssetsList: React.FC<IProps> = ({ privateKey }) => {
  const { deriveAssetKey, accounts } = useAppStore();

  //   const [extendedPrivateKey, setExtendedPrivateKey] = React.useState<string>("");
  //   const [derivedAssetKey, setDerivedAssetKey] = React.useState<string | null>(null);

  const assetsListItems = React.useMemo(() => {
    return accounts.reduce<IAssetListItem[]>((assets, account) => {
      Object.keys(account).forEach((assetId) => {
        const assetInfo = account[assetId];
        if (assetInfo.asset.type === "BASE_ASSET") {
          const asset: IWalletAsset = assetInfo.asset;
          const accountId = Number(assetInfo.address?.accountId ?? 0);
          const addressIndex = Number(assetInfo.address?.addressIndex ?? 0);
          const change: number = 0;
          const derivationPathStr = `m/44'/${asset.coinType}'/${account}'/${change}/${addressIndex}`;
          const derivedAssetKey = deriveAssetKey(privateKey, asset.coinType, accountId, change, addressIndex);

          const assetListItem: IAssetListItem = {
            id: `ACCOUNT_#${accountId}_${asset.id}`,
            assetId: asset.id,
            name: asset.name,
            iconUrl: asset.iconUrl,
            coinType: asset.coinType,
            derivedAssetKey,
            accountId,
            addressIndex,
            derivationPathStr,
          };
          assets.push(assetListItem);
        }
      });
      return assets;
    }, []);
  }, [accounts]);

  return (
    <Table>
      <Row data={["Asset", "Name", "Derrived Key"]}></Row>
        {assetsListItems.map((assetListItem) => (
          <Row key={`derrived_${assetListItem.id}`} data={[
            assetListItem.assetId,
            assetListItem.name,
            <Copyable value={assetListItem.derivedAssetKey} />]} />
          // <tr key={assetListItem.id}>
          //   <td className="flex items-center gap-2">
          //     {assetListItem.iconUrl ? <img src={assetListItem.iconUrl} className="w-8 h-8"></img> : missingIcon}
          //     <span>{assetListItem.assetId}</span>
          //   </td>
          //   <td>{assetListItem.name}</td>
          //   <td>
          //     <Copyable value={assetListItem.derivedAssetKey} />
          //   </td>
          // </tr>
        ))}
  </Table>
  );
};
