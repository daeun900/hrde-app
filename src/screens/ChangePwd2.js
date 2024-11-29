import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useLogoutHandler from '../hooks/LogoutHandler';
import styled from 'styled-components/native';
import { Input } from '../components';
import { useDomain } from "../context/domaincontext";

import axios from 'axios';

export default function ChangePwd2({ route, navigation }) {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const refPassword = useRef(null);
  const { domain } = useDomain();
  const { id } = route.params; 

  //뒤로가기 시 로그아웃
  useLogoutHandler(navigation, domain);

  //비밀번호 변경
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('오류', '비밀번호를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const requestData = {
        newPw1: password,
        newPw2: confirmPassword,
        id: id,
      };

      const response = await axios.post(`${domain}/mobile/update_default_pw.php`, requestData);
      const result = response.data.result;
 
      if (result === 'P') {
        Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다.', [
          { text: '확인', onPress: () => navigation.replace('Tab') },
        ]);
      } else if (result === 'E1') {
        Alert.alert('오류', '비밀번호 변경 중 문제가 발생했습니다. 다시 시도해주세요.');
      } else if (result === 'E2') {
        Alert.alert('오류', '비밀번호 조건을 확인해주세요. 다시 입력하세요.');
      } else {
        Alert.alert('오류', '알 수 없는 문제가 발생했습니다. 관리자에게 문의하세요.');
      }
    } catch (error) {
      console.error('서버 요청 오류:', error);
      Alert.alert('오류', '서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
    }
  };

  return (
    <Container insets={insets} style={{flex:1, paddingTop: insets.top, backgroundColor:'#fff'}}>
      <Title>비밀번호 변경</Title>
      <SubTitle>최초 로그인 시, 비밀번호를 변경하여야 합니다.</SubTitle>
      <StepIndicator>
        <StepItem>
          <StepCircle>
            <StepNumber>1</StepNumber>
          </StepCircle>
          <StepLabel>본인인증</StepLabel>
        </StepItem>
        <StepLine />
        <StepItem>
          <StepCircle active>
            <StepNumber>2</StepNumber>
          </StepCircle>
          <StepLabel active>비밀번호 변경</StepLabel>
        </StepItem>
      </StepIndicator>
      <Input 
        label="비밀번호" 
        placeholder="비밀번호를 입력하세요."
        returnKeyType="next"
        value={password}
        onChangeText={setPassword}
        isPassword={true}
        onSubmitEditing={()=>refPassword.current.focus()}
        containerStyle={{
          borderTopWidth: 1,
          borderTopColor:'#ddd',
          paddingTop:20,
        }}
        inputStyle={{
          backgroundColor: '#f8f8f8',
      }}
        />
        <BottomText>
        ※ 비밀번호는 영문, 숫자, 특수문자 중 2개 이상의 조합으로 10자 이상 또는 3개 이상의 조합으로 8자 이상 사용하세요.</BottomText>
     <Input 
        ref= {refPassword}
        label="비밀번호 확인" 
        placeholder="비밀번호를 한번 더 입력하세요."
        returnKeyType="next"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword={true}
        onSubmitEditing={setConfirmPassword}
        containerStyle={{
          borderTopWidth: 1,
          borderTopColor:'#ddd',
          paddingTop:20
        }}
        inputStyle={{
          backgroundColor: '#f8f8f8',
      }}
      />
      <BottomText>
        ※ 정확한 확인을 위해 비밀번호를 한번 더 입력하세요.
      </BottomText>
      <ChangeButton onPress={handleChangePassword}>
        <ButtonText>변경하기</ButtonText>
      </ChangeButton>
    </Container>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 30px;
  font-weight: bold;
  margin: 30px 0 10px 0;
`;

const SubTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const BottomText = styled.Text`
  color:#606060;
  line-height: 20px;
  margin-bottom: 10px;
`

const ChangeButton = styled(TouchableOpacity)`
  background-color: #007bff;
  padding: 15px;
  border-radius: 5px;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 100px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

const StepIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
  justify-content: center;
`;

const StepItem = styled.View`
  align-items: center;
`;

const StepCircle = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: ${({ active }) => (active ? '#007bff' : '#ccc')};
  justify-content: center;
  align-items: center;
`;

const StepNumber = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

const StepLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${({ active }) => (active ? '#007bff' : '#ccc')};
  margin-top: 5px;
`;

const StepLine = styled.View`
  width: 40px;
  height: 2px;
  background-color: #ccc;
  margin: 0 10px;
`;