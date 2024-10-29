import React, {useContext, useState, useRef, useEffect} from "react";
import { ImageBackground, Alert } from "react-native";
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
line-height: 20px;
text-align: center;
margin-top: 10px;
margin-bottom: 10px;
`


const Start = ({ navigation }) => {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결

  // selectbox
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

   // 교육원 목록 가져오기
   const { setDomain } = useDomain(); 

   const fetchEduCenters = async () => {
    try {
      const response = await axios.get("https://app.hrdelms.com/edu_center.php");
      const centers = response.data;

      const dropdownItems = Object.keys(centers).map((key) => ({
        label: centers[key],
        value: key,
      }));

      setItems(dropdownItems);
    } catch (error) { 
      console.error(error);
      Alert.alert("오류", "교육원 목록을 가져오는 중 문제가 발생했습니다.");
    }
  };

  // 선택된 교육원의 도메인 받아오기
  const fetchDomain = async (centerCode) => {
    try {
      const response = await axios.post("https://app.hrdelms.com/edu_center_domain.php", {
        center: centerCode,
      });

      const domain = response.data.domain;
      if (domain && domain !== "No matching domain found") {
        setDomain(domain);
      } else {
        Alert.alert("오류", "해당 교육원의 URL을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "URL을 가져오는 중 문제가 발생했습니다.");
    }
  };

  // DropDown에서 선택된 값이 변경될 때 API 호출
  useEffect(() => {
    if (value) {
      fetchDomain(value);
    }
  }, [value]);

  useEffect(() => {
    fetchEduCenters();
  }, []);

  const handleLoginPress = () => {
    if (!value) {
      Alert.alert("", "교육원을 선택해주세요.");  // 교육원 미선택 시 경고창
    } else {
      navigation.navigate("Signin");  // 교육원 선택 후 로그인 가능
    }
  };

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
            listMode="MODAL"   
            maxHeight={300} 
            placeholder="교육원을 선택하세요"
            containerStyle={{ marginTop: 15, borderColor: '#EEEEEE' , zIndex:10 }}
            style={{ paddingHorizontal: 20, paddingVertical: 20, borderColor: '#EEEEEE'}}
            textStyle={{ fontSize: 16 }}
            placeholderStyle={{ color: '#9a9a9a' }}
            dropDownContainerStyle={{ borderColor: '#EEEEEE', paddingHorizontal: 10 }}
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
 
  );
};

export default Start;
