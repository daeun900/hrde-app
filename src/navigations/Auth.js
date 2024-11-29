import React, {useContext} from "react";
import { TouchableOpacity } from "react-native";
import { ThemeContext } from "styled-components/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Start, Signin, Notification, Agree, ChangePwd, ChangePwd2 } from "../screens";
import {Feather} from '@expo/vector-icons'
import TabNav from "./Tab";

const Stack = createStackNavigator();



const Auth = () => {
  const theme = useContext(ThemeContext);

  return (
    <Stack.Navigator>
      <Stack.Screen
          name="Start"
          component={Start}
          options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signin"
        component={Signin}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="Agree"
        component={Agree}
        options={{ headerShown: false, gestureEnabled: false}}
        
      />
       <Stack.Screen
        name="ChangePwd"
        component={ChangePwd}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="ChangePwd2"
        component={ChangePwd2}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Tab"
        component={TabNav} 
        options={{headerShown: false}}
      />
 
    </Stack.Navigator>
  );
};

export default Auth;
