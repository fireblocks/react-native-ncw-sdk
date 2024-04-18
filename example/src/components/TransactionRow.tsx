import React from "react";
import { useAppStore } from "../AppStore";
import { ITransactionData, ITransactionDetails, TTransactionStatus } from "../services/ApiService";
import { Row } from "react-native-reanimated-table";
import Svg, { Path } from "react-native-svg";
import { Button } from "react-native";

interface IProps {
  tx: ITransactionData;
  showTx(txId: string): void;
}

// const formatter = new Intl.RelativeTimeFormat("en-us", {
//   numeric: "auto",
// });

const outgoingIcon = (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  // className="w-5 h-5"
  >
    <Path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </Svg>
);
const incomingIcon = (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  // className="w-5 h-5"
  >
    <Path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
  </Svg>
);
const rebalanceIcon = (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  // className="w-5 h-5"
  >
    <Path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3" />
  </Svg>
);
const pendingIcon = (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  // className="w-5 h-5"
  >
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

function formatTimeAgo(date: Date) {
  let duration = (date.valueOf() - new Date().valueOf()) / 1000;

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i];
    if (Math.abs(duration) < division.amount) {
      // return formatter.format(Math.round(duration), division.name);
      return "";
    }
    duration /= division.amount;
  }
}

export function isFinal(status: TTransactionStatus) {
  switch (status) {
    case "COMPLETED":
    case "FAILED":
    case "CANCELLED":
      return true;
    default:
      return false;
  }
}

function statusColor(status: TTransactionStatus) {
  switch (status) {
    case "PENDING_SIGNATURE":
    case "CANCELLING":
      return "text-warning";
    case "COMPLETED":
      return "text-success";
    case "FAILED":
    case "CANCELLED":
      return "text-error";
    default:
      return "text-info";
  }
}

function getDirection(walletId: string, details?: ITransactionDetails) {
  if (!details) {
    return pendingIcon;
  }
  const isOutgoing = (tx: ITransactionDetails) => tx.source.walletId === walletId;
  const isIncoming = (tx: ITransactionDetails) => tx.destination.walletId === walletId;

  if (isOutgoing(details) && isIncoming(details)) {
    return rebalanceIcon;
  } else if (isOutgoing(details)) {
    return outgoingIcon;
  } else if (isIncoming(details)) {
    return incomingIcon;
  }
}

export const TransactionRow: React.FC<IProps> = ({ tx, showTx }) => {
  const { walletId } = useAppStore();
  const isMountedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isOutgoing = (tx: ITransactionDetails) => tx.source.walletId === walletId;

  return (
    <Row
      key={tx.id}
      data={[
        tx.id,
        formatTimeAgo(new Date(tx.createdAt!)),
        tx.details?.assetId,
        tx.details?.operation,
        tx.status,
        <Button title="Show" onPress={() => showTx(tx.id)} />]}
    />
  );
};
