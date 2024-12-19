import React, {useContext, useState, useRef, useEffect} from "react";
import { ImageBackground, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useDomain } from "../context/domaincontext";
import styled from "styled-components/native";
import { Button,Image,Input } from "../components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DropDownPicker from 'react-native-dropdown-picker';
import axios from "axios"; 

const Container = styled.View`
  flex: 1;
  justify-content:space-between;
  background-image: url(../../assets/intro_bg.png);
  padding: 0 20px;
  padding-top: ${({ insets: { top } }) => top}px;
  padding-bottom: ${({ insets: { bottom } }) => bottom}px;
  position: relative;
`;

const SelectSec = styled.View`
margin-top: 80px;
` 
const LoginSec = styled.View`
` 

const BigTxt = styled.Text`
font-size:20px;
font-weight: 600;
color: #444;
line-height: 30px;
padding-left: 10px;
`

const SmallTxt = styled.Text`
font-size:14px;
color: #767676;
line-height: 20px;
text-align: center;
margin-top: 10px;
margin-bottom: 10px;
`


const Start = ({ navigation }) => {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결

   const { setDomain } = useDomain(); 
   const [code, setCode] = useState(""); 

  const handleLoginPress = async () => {
    if (!code) {
      Alert.alert("", "교육원 코드를 입력해주세요."); 
      return;
    }

    try {
      const response = await axios.post("https://app.hrdelms.com/edu_center_domain.php", {
        center: code,
      });
      const domain = response.data.domain;
      if (domain && domain !== "No matching domain found") {
        setDomain(domain); // 도메인 설정
        navigation.navigate("Signin"); // 유효한 도메인이 설정되면 로그인 화면으로 이동
      } else {
        setCode(""); // 입력값 초기화
        Alert.alert("오류", "해당 교육원을 찾을 수 없습니다.");
      }
    } catch (error) {
      setCode(""); // 에러 발생 시 입력값 초기화
      Alert.alert("오류", "도메인 설정 중 문제가 발생했습니다.");
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ImageBackground 
      style={{ width: "100%", height: "100%" }}  //View를 꽉채우도록
      source={require("../../assets/intro_bg.png")}  //이미지경로
      resizeMode="cover" // 'cover', 'contain', 'stretch', 'repeat', 'center' 중 선택 
      onPress={() => Keyboard.dismiss()} >
      <Container insets={insets}>
        <SelectSec>
          <BigTxt>교육원 코드를 입력해주세요.</BigTxt>
          <Input
            placeholder="교육원 코드를 입력하세요"
            value={code}
            onChangeText={setCode}
            containerStyle={{ marginTop:-10,borderColor: "#EEEEEE" }}
          />
        </SelectSec>
       <LoginSec>
          <Button title="로그인"  containerStyle={{borderRadius: 50}}  backgroundColor="#008DF3"  onPress={handleLoginPress}/>
          <SmallTxt>
            회원이 아니신 경우 PC에서 회원가입 후 이용해주세요
          </SmallTxt>
       </LoginSec>
      
      </Container>
    </ImageBackground>
     </TouchableWithoutFeedback>
  );
};

export default Start;
