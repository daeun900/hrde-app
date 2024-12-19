import React, {useContext, useState, useRef} from "react";
import { Keyboard , Alert} from "react-native";
import { ThemeContext } from "styled-components/native";
import styled from "styled-components/native";
import { Button,Image,Input } from "../components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';
import { useDomain } from "../context/domaincontext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from 'expo-device';

const Container = styled.Pressable`
  flex: 1;
  justify-content: flex-start;
  background-color: #F8F8F8;
  padding: 0 20px;
  padding-top: ${({ insets: { top } }) => top}px;
  padding-bottom: ${({ insets: { bottom } }) => bottom}px;
`;
 
const LogoImg = styled.Image`
width: 190px;
height: 35px;
margin-top: 50px;
` 

const BigTxt =styled.Text`
font-size:20px;
font-weight: 500;
margin-top: 30px;
`

const SmallTxt = styled.Text`
font-size:14px;
color: #767676;
margin: 15px 0 30px 0;
`
const setSession = (key, data) => {
// 현재 시간을 Unix 타임스탬프로 얻기
const currentTimeStamp = Math.floor(Date.now() / 1000); // 초 단위로 변환

// 2시간 후의 시간을 구하기 (현재 시간에 2시간을 더함)
const twoHoursLaterTimeStamp = currentTimeStamp + (2 * 60 * 60);

// AsyncStorage에 데이터 저장
const storeData = async () => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({
      value: data,
      createdTime: currentTimeStamp,
      expirationTime: twoHoursLaterTimeStamp
    }));
  } catch (error) {
    console.error('Error storing data:', error);
  }
};

// AsyncStorage에 데이터 저장 함수 호출
storeData();
}


const Signin = ({navigation}) => {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const theme = useContext(ThemeContext);
  const { domain } = useDomain();

  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const refPassword = useRef(null);

  const getDeviceId = async () => {
    if (Device.isDevice) {
      return Device.osInternalBuildId || Device.modelId || 'unknown_device';
    }
    return 'unknown_device';
  };
  const _handleSigninBtnPress = async () => {
    const deviceId2 = await getDeviceId();
    console.log("Device ID:", deviceId2);
    login(deviceId2);
  }

  const login = async (deviceId2) => {
    if (id.trim() === "") {
      Alert.alert("아이디 입력 확인", "아이디가 입력되지 않았습니다.");
    } else if (password.trim() === "") {
      Alert.alert("비밀번호 입력 확인", "비밀번호가 입력되지 않았습니다.");
    } else {
      try {
        console.log(domain)
        const response = await axios.post(`${domain}/mobile/sign_in.php`, { id: id, pwd: password, deviceId: deviceId2 });
        const result = response.data.result;

        console.log('Server response:', response.data);
        console.log('Result:', result);

        if (result === "Y" || result === "A" || result === "P" || result === "AP") {
          const name = response.data.name;
          const mobile = response.data.mobile.replace(/-/g, "");;
          const birthday = response.data.birthday.replace(/-/g, "");;
          
          setSession('userId', id); // 아이디 세션 저장
          setSession('userNm', name); // 이름 세션 저장
          setSession('userMb', mobile); // 전화번호 세션 저장
          setSession('userBd', birthday); // 생년월일 세션 저장

          // const testApi = await axios.post(`${domain}/mobile/give_session.php`, { id: id, seq: 11 });
          // const result2 = testApi.data.sessionValue;
          // console.log('result2:',result2)
        }
        if (result === "Y") {
          navigation.navigate("Tab");
        } else if (result === "N1") {
          Alert.alert("로그인 실패", "아이디나 비밀번호를 확인하세요.");
          setID("");
          setPassword("");
        } else if (result === "N2") {
          Alert.alert("로그인 실패", "비밀번호가 일치하지 않습니다.");
          setPassword("");
        } else if (result === "N3") {
          Alert.alert("로그인 실패", "휴면 계정입니다. 관리자에게 문의하세요.");
        }
        else if (result === "A") {
          Alert.alert("로그인", "필수 동의사항 미동의 회원입니다. 필수 동의사항 동의 후 이용 바랍니다.",[
            { text: '확인', onPress: () =>  navigation.navigate("Agree", { id: id, result:result }) },
          ]);
        }
        else if (result === "P") {
          Alert.alert("로그인", "초기 비밀번호 이용중입니다. 비밀번호 변경 후 이용 바랍니다.",[
            { text: '확인', onPress: () =>  navigation.navigate("ChangePwd", { id: id }) },
          ]);
        }
        else if (result === "AP") {
          Alert.alert("로그인", "초기 비밀번호 이용중입니다. 필수 동의사항 동의 및 비밀번호 변경 후 이용 바랍니다.",[
              { text: '확인', onPress: () =>  navigation.navigate("Agree", { id: id, result:result }) },
            ]);
        }
      } catch (err) {
        console.log(`Error Message: ${err}`);
      }
    }
  };


  return (
    <Container insets={insets} onPress={() => Keyboard.dismiss()}>
     <LogoImg source={{uri: `${domain}/common/img/logo.png`}}   resizeMode="contain" />
      <BigTxt>당신의 도전을 응원합니다.</BigTxt>
      <SmallTxt>즐거운 강의 시청으로 당신의 직무능력 UP!</SmallTxt>
      <Input 
        label="아이디" 
        placeholder="아이디를 입력하세요."
        returnKeyType="next"
        value={id}
        onChangeText={setID}
        onSubmitEditing={()=>refPassword.current.focus()}
        />
      <Input 
        ref= {refPassword}
        label="비밀번호" 
        placeholder="비밀번호를 입력하세요."
        returnKeyType="next"
        value={password}
        onChangeText={setPassword}
        isPassword={true}
        onSubmitEditing={_handleSigninBtnPress}
      />
      <Button title="로그인"  
      containerStyle={{borderRadius: 10}} 
      backgroundColor="#008DF3"
      onPress={() => _handleSigninBtnPress() } />
  
    </Container>
  );
};

export default Signin;
