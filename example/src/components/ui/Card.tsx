import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export interface ICardAction {
  action?: () => void;
  isDisabled?: boolean;
  isInProgress?: boolean;
  buttonVariant?: "primary" | "accent";
  label: string;
}

interface IProps {
  title: string;
  children?: React.ReactNode;
  actions?: ICardAction[];
}

const CardActionButton: React.FC<ICardAction> = ({
  action,
  isDisabled = false,
  isInProgress = false,
  buttonVariant = "primary",
  label,
}) => {
  const buttonClassName = buttonVariant === "primary" ? "btn btn-primary" : "btn btn-accent";
  return (
    <View style={styles.actions} /*className="card-actions"*/>
      <Button title={label} /*className={buttonClassName}*/ disabled={isDisabled} onPress={action}/>
        {/* // {isInProgress && <span className="loading loading-spinner">x</span>} */}
    </View>
  );
};

export const Card: React.FC<IProps> = ({ title, children, actions = [] }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle} /*className="card-title"*/>{title}</Text>
      {children}
      <View style={styles.row} /*className="flex flex-row gap-4"*/>
          {actions.map((action) => (
            <CardActionButton key={action.label} {...action} />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
    borderColor: 'black',
    borderWidth: 1,
    flex: 1
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: 'wrap'
  },
  actions: {
    // display: "flex",
    // flexDirection: "column",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: '1%',
    marginBottom: 6,
    justifyContent: "space-between"
  }
});