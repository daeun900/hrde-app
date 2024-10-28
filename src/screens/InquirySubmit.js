import React, { useEffect, useContext, useState, useRef } from "react";
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from "react-native";
import styled from "styled-components/native";
import { Button } from "../components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "../context/userContext";
import DropDownPicker from 'react-native-dropdown-picker';
import Canvas from 'react-native-canvas';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Container = styled.View`
  padding: 30px;
  background-color: #fff;
  flex: 1;
`;

const Label = styled.Text`
  font-size: 16px;
  line-height: 24px;
  margin-top: 20px;
`;

const SmallTxt = styled.Text`
  font-size: 14px;
  line-height: 20px;
  font-weight: 200;
  color: #767676;
  margin-top: 10px;
`;

const Name = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: #0059C1;
  margin-left: 20px;
  margin-top: 20px;
`;

const Input = styled.TextInput.attrs(({ theme }) => ({ placeholderTextColor: theme.inputPlaceholder }))`
  color: #111111;
  padding: 20px 10px;
  font-size: 16px;
  border: 1px solid ${({ theme, isFocused }) => isFocused ? '#ccc' : '#eee'};
  border-radius: 10px;
  margin-top: 10px;
`;

const InputContainer = styled.View`
  position: relative;
`;

const CaptchaCanvas = styled(Canvas)`
  position: absolute;
  top: 24px;
  left: 10px;
  width: 150px;
  height: 50px;
`;

const InquirySubmit = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userNm, updateUserNm } = useContext(UserContext);

  useEffect(() => {
    updateUserNm();
    getUserId();
  }, []);

  const [isFocused, setIsFocused] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');

  // selectbox
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  // captcha
  const canvasRef = useRef(null);
  const [randomText, setRandomText] = useState('');

  //userID추출
  const getUserId = async () => {
    try {
      const idString = await AsyncStorage.getItem('userId');
      if (idString !== null) {
        const idObject = JSON.parse(idString);
        const userId = idObject.value;
        setUserId(userId);
      }
    } catch (error) {
      console.error('Failed to fetch the user ID:', error);
    }
  };

  useEffect(() => {
    // 문의종류가져오기
    fetch('https://hrdelms.com/mobile/ask_array.php')
      .then((response) => response.json())
      .then((data) => {
        if (data.askArray) {
          const formattedItems = data.askArray.map(item => ({
            label: item[1],  // value
            value: item[0]   // key
          }));
          setItems(formattedItems);
        }
      })
      .catch((error) => {
        console.error('Error fetching inquiry types:', error);
      });

    generateRandomText();
  }, []);

  //캡차이미지생성
  const generateRandomText = () => {
    const randomText = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // 5자리 숫자 생성
    setRandomText(randomText);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      drawTextOnCanvas(ctx, randomText);
    }
  };

  const handleCanvas = (canvas) => {
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvasRef.current = canvas;
      drawTextOnCanvas(ctx, randomText);
    }
  };

  const drawTextOnCanvas = (ctx, text) => {
    const width = 86;
    const height = 35;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText(text, 10, 25);
  };

  //문의제출
  const submit = () => {
    if (!value) {
      Alert.alert('문의 종류 선택', '문의 종류를 선택하세요.');
      return;
    }
  
    if (!title.trim()) {
      Alert.alert('문의 제목 입력', '제목을 입력하세요.');
      return;
    }
  
    if (!content.trim()) {
      Alert.alert('문의 내용 입력', '내용을 입력하세요.');
      return;
    }
    const name = userNm;
    //보안코드확인
    const isPassed = randomText === captcha ? 'Y' : 'N';
    const pass_code_info = `${randomText}${isPassed}${captcha}`;

    const data = {
      id: userId,
      name,
      pass_code_info,
      type: value,
      title,
      content,
    };

    console.log(data);
    axios.post('https://hrdelms.com/mobile/ask.php', data)
      .then((response) => {
        console.log(response.data.result);
        if (response.data.result === 'Y') {
          navigation.navigate("InquiryComplete");
        } else if (response.data.result === 'N1') {
          Alert.alert('보안코드 오류', '보안코드를 확인하세요.');
        } else if (response.data.result === 'N2' || response.data.result === 'N3') {
          Alert.alert('문의 등록 실패', '문의 등록에 실패했습니다. 관리자에게 문의하세요.');
        } else {
          Alert.alert('Submission failed', response.data.result);
        }
      })
      .catch((error) => {
        console.error('Error submitting inquiry:', error);
      });
  };

  const renderItem = () => (
    <Container contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <View style={{ flexDirection: 'row' }}>
        <Label>이름</Label>
        <Name>{userNm}</Name>
      </View>
      <SmallTxt>* 1:1문의는 실시간으로 답변이 불가합니다. 빠른 상담을 원하시는 경우 카카오톡 상담을 이용해주세요</SmallTxt>
      <Label>보안코드</Label>
      <InputContainer>
        <CaptchaCanvas ref={handleCanvas} />
        <Input
          placeholder="왼쪽의 보안코드를 입력하세요"
          isFocused={isFocused}
          onFocus={() => setIsFocused(true)}
          value={captcha}
          onChangeText={setCaptcha}
          style={{ paddingLeft: 100 }}
        />
      </InputContainer>
      <Label>문의종류</Label>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="문의유형을 선택하세요"
        containerStyle={{ marginTop: 20, borderColor: '#EEEEEE' , zIndex:10 }}
        style={{ paddingHorizontal: 20, paddingVertical: 10, borderColor: '#EEEEEE'}}
        textStyle={{ fontSize: 16 }}
        placeholderStyle={{ color: '#9a9a9a' }}
        dropDownContainerStyle={{ borderColor: '#EEEEEE', paddingHorizontal: 10 }}
      />
      <Label>문의 제목</Label>
      <Input
        placeholder="제목을 입력하세요"
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        value={title}
        onChangeText={setTitle}
      />
      <Label>문의 내용</Label>
      <Input
        placeholder="문의내용을 입력하세요"
        isFocused={isFocused}
        onFocus={() => setIsFocused(true)}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        style={{ height: 200 }}
      />
      <Button title="문의하기"  
        containerStyle={{borderRadius: 10,marginBottom:20}} 
        textStyle={{fontSize:16}}  
        backgroundColor="#008DF3"
        onPress={submit}
      />
    </Container>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <FlatList
        data={[{ key: 'inquiry' }]}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
      />
    </KeyboardAvoidingView>
  );
};

export default InquirySubmit;
