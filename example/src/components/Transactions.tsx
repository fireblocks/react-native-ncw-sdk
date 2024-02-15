import React from "react";
import { useAppStore } from "../AppStore";
import { TransactionRow } from "./TransactionRow";
import { IActionButtonProps } from "./ui/ActionButton";
import { Card } from "./ui/Card";
import { Row, Table } from "react-native-reanimated-table";
import { NewTxDialog } from "./ui/NewTxDialog";
import { ViewTxDialog } from "./ui/ViewTxDialog";
// import { NewTxDialog } from "./ui/NewTxDialog";

export const Transactions: React.FC = () => {
  const { txs, accounts } = useAppStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [isViewTxModalOpen, setIsViewTxModalOpen] = React.useState(false);
  const [viewTxId, setIsViewTxId] = React.useState<string|null>(null);


  const onOpenModal = () => setIsModalOpen(true);
  const onCloseModal = () => setIsModalOpen(false);

  const onShowTx = (txId: string) => {
    setIsViewTxId(txId);
    setIsViewTxModalOpen(true);
  }

  const onCloseViewTxModal = () => setIsViewTxModalOpen(false);

  const assetsToSelectFrom = React.useMemo(() => {
    const assetsList = accounts.map((account) => {
      return Object.entries(account).map(([_, assetInfo]) => {
        const { id, name, iconUrl } = assetInfo.asset;
        return { id, name, iconUrl, balance: assetInfo.balance?.total ?? "" };
      });
    });

    return assetsList[0];
  }, [accounts]);

  const createTxAction: IActionButtonProps = {
    action: onOpenModal,
    label: "Create Tx",
    isDisabled: !assetsToSelectFrom?.length,
  };

  return (
    <Card title="Transactions" actions={[createTxAction]}>
      <Table>
        <Row 
          data={["TxId", "Last updated", "Asset", "Operation", "Status", "Details"]} 
          
        />
        {txs.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} showTx={onShowTx} />
        ))}
      </Table>
      {assetsToSelectFrom && (
        <NewTxDialog isOpen={isModalOpen} onClose={onCloseModal} assetsToSelectFrom={assetsToSelectFrom} />
      )}
      <ViewTxDialog isOpen={isViewTxModalOpen} onClose={onCloseViewTxModal} txId={viewTxId} />
    </Card>
  );
};
