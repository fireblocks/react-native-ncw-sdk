import React from 'react';
import { Text, View } from 'react-native';

interface IProps {
  errorStr: string | null;
}

export const ErrorToast: React.FC<IProps> = ({ errorStr }) => {
  const isMountedRef = React.useRef<boolean>(false);
  const [internalErrorStr, setInternalErrorStr] = React.useState<string | null>(
    errorStr
  );

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (!isMountedRef.current) {
      return;
    }

    setInternalErrorStr(errorStr);
    if (errorStr) {
      const timerId = setTimeout(() => {
        if (isMountedRef.current) {
          setInternalErrorStr(null);
        }
      }, 10000);

      return () => {
        clearTimeout(timerId);
      };
    }
    return;
  }, [errorStr]);

  if (internalErrorStr === null) {
    return null;
  }

  return (
    // <div className="toast toast-container">
    <View /*className="alert alert-error"*/>
      <Text>{internalErrorStr}</Text>
    </View>
    // </div>
  );
};
