/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useAppStore } from '../AppStore';
import type { IActionButtonProps } from './ui/ActionButton';
import { Card } from './ui/Card';
import { Text, View } from 'react-native';
// import Svg, { Path } from 'react-native-svg';

export const LoginToDemoAppServer: React.FC = () => {
  const {
    userId,
    loginToDemoAppServerStatus,
    automateInitialization,
    loginToDemoAppServer,
  } = useAppStore();

  React.useEffect(() => {
    if (automateInitialization && userId === null) {
      loginToDemoAppServer();
    }
  }, [loginToDemoAppServer, automateInitialization, userId]);

  const cardAction: IActionButtonProps = {
    action: loginToDemoAppServer,
    isDisabled: loginToDemoAppServerStatus === 'started' || !!userId,
    isInProgress: loginToDemoAppServerStatus === 'started',
    label: 'Login to the Demo App Server',
  };

  return (
    <Card title="Login" actions={[cardAction]}>
      {userId && (
        <View /*className="mockup-code"*/>
          {/* <pre> */}
          <Text>User ID: {userId}</Text>
          {/* </pre> */}
        </View>
      )}
      {loginToDemoAppServerStatus === 'failed' && (
        <View /*className="alert alert-error shadow-lg"*/>
          <View>
            {/* <Svg
              // xmlns="http://www.w3.org/2000/svg"
              // className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </Svg> */}
            <Text>Unable to Login to Demo App Server</Text>
          </View>
        </View>
      )}
    </Card>
  );
};
