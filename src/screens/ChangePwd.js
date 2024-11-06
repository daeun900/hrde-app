import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from 'styled-components/native';
import { Input } from '../components';

export default function ChangePwd() {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const refPassword = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    Alert.alert('성공', '비밀번호가 성공적으로 변경되었습니다.');
    // 여기서 비밀번호 변경 API 요청 등을 추가할 수 있습니다.
  };

  return (
    <Container insets={insets}>
      <Title>비밀번호 변경</Title>
      <SubTitle>최초 로그인 시, 비밀번호를 변경하여야 합니다.</SubTitle>
      <Input 
        label="비밀번호" 
        placeholder="비밀번호를 입력하세요."
        returnKeyType="next"
        value={password}
        onChangeText={setPassword}
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

const Container = styled.View`
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
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;
