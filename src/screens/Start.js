import React, {useContext, useState, useRef} from "react";
import { ImageBackground } from "react-native";
import { ThemeContext } from "styled-components/native";
import styled from "styled-components/native";
import { Button,Image,Input } from "../components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DropDownPicker from 'react-native-dropdown-picker';

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
margin-top: 100px;
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
line-height: 50px;
`


const Start = ({ navigation }) => {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결

  // selectbox
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  return (
    <ImageBackground 
      style={{ width: "100%", height: "100%" }}  //View를 꽉채우도록
      source={require("../../assets/intro_bg.png")}  //이미지경로
      resizeMode="cover" // 'cover', 'contain', 'stretch', 'repeat', 'center' 중 선택 
      >
      <Container insets={insets}>
        <SelectSec>
            <BigTxt>교육원을 선택해주세요.</BigTxt>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="교육원을 선택하세요"
              containerStyle={{ marginTop: 15, borderColor: '#EEEEEE' , zIndex:10 }}
              style={{ paddingHorizontal: 20, paddingVertical: 20, borderColor: '#EEEEEE'}}
              textStyle={{ fontSize: 16 }}
              placeholderStyle={{ color: '#9a9a9a' }}
              dropDownContainerStyle={{ borderColor: '#EEEEEE', paddingHorizontal: 10 }}
            />
        </SelectSec>
       <LoginSec>
          <Button title="로그인"  containerStyle={{borderRadius: 50}}  backgroundColor="#008DF3"  onPress={() => navigation.navigate("Signin")}/>
          <SmallTxt>
            회원이 아니신 경우 PC에서 회원가입 후 이용해주세요
          </SmallTxt>
       </LoginSec>
      
      </Container>
    </ImageBackground>
 
  );
};

export default Start;
