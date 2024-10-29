import React, { useEffect, useContext, useState } from "react";
import { StyleSheet, Platform, Text, View, Image, Linking, ImageBackground, Alert, Dimensions } from "react-native";
import styled from "styled-components/native";
import { TopSec } from "../components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "../context/userContext";
import { Entypo } from '@expo/vector-icons';
import { useDomain } from "../context/domaincontext";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHTML from 'react-native-render-html';

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

const FlexBox = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 13px;
`;

const MidTxt = styled.Text`
  font-size: 16px;
  line-height: 24px;
`;

const SmallTxt = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${({ status }) => (status === '답변완료' ? '#fff' : '#000')};
`;

const ItemContainer = styled.View``;

const QuestionContainer = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom-width: 1px;
  border-color: #DEDEDE;
`;

const QuestionText = styled.View`
  max-width: 90%;
`;

const Status = styled.View`
  font-size: 14px;
  padding: 3px 5px;
  border-width: 1px;
  border-color: #333;
  border-radius: 6px;
  margin-right: 10px;
  background-color: ${({ status }) => (status === '답변완료' ? '#000' : 'transparent')};
`;

const AnswerContainer = styled.View`
  background-color: #F8F8F8;
  padding: 20px;
  border-bottom-width: 1px;
  border-color: #DEDEDE;
`;

const NullContainer = styled.View`
  flex: 1;
  background-color: #fff;
  align-items: center;
  justify-content: center;
`;


const AccordionItem = ({ question, answer, status, date, idx  }) => {
  const [expanded, setExpanded] = useState(false);
  const [fetchedAnswer, setFetchedAnswer] = useState("");
  const { domain } = useDomain();

  useEffect(() => {
    if (expanded) {
      fetchAnswer();
    }
  }, [expanded]); //expand가 될때만 실행

  //답변확인
  const fetchAnswer = async () => {
      try {
        const response = await axios.post(`${domain}/mobile/ask_answer.php`, { idx });
        setFetchedAnswer(response.data.answer);
        console.log(response.data.answer)
      } catch (error) {
        console.error('Error fetching answer:', error);
      }
  };

  const contentWidth = Dimensions.get('window').width;

  const handlePress = () => {
    if (status === "답변완료") {
      setExpanded(!expanded);
    }
  };

  return (
    <ItemContainer>
      <QuestionContainer  onPress={handlePress} activeOpacity={status === '답변완료' ? 0.8 : 1}>
        <QuestionText>
          <FlexBox>
            <Status status={status}>
              <SmallTxt status={status}>{status}</SmallTxt>
            </Status>
            <SmallTxt>{date}</SmallTxt>
          </FlexBox>
          <MidTxt>{question}</MidTxt>
        </QuestionText>
        {status === '답변완료' && (
          <Entypo
            name={expanded ? 'chevron-thin-up' : 'chevron-thin-down'}
            size={20}
            color="#333"
          />
        )}
      </QuestionContainer>

      {expanded &&  (
        <AnswerContainer>
            <RenderHTML 
            contentWidth={contentWidth} 
            source={{ html: fetchedAnswer }}
          />
        </AnswerContainer>
      )}
    </ItemContainer>
  );
};

const InquiryView = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // 아이폰 노치 문제 해결
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState('');
  const { domain } = useDomain();
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

  const statusMap = {
    'A': '답변대기',
    'B': '답변완료'
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${domain}/mobile/ask_list.php`, {
          id: userId 
        }, {
          timeout: 10000 
        });
        if (response.data && response.data.askList) {
          setData(response.data.askList.map(item => ({
            question: item[0],
            date: item[1],
            status: statusMap[item[2]] || 'Unknown',
            answer: null,
            idx: item[3]  
          })));
        }
        console.log(userId);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Unable to fetch data. Please try again later.');
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    getUserId();
  }, []);
  return (
    <View insets={insets} style={{ flex: 1 }}>
      {data.length === 0 ? (
        <NullContainer>
          <Image source={require('../../assets/icon_null.png')} style={{ marginBottom: 20 }} />
          <MidTxt>문의내역이 없습니다</MidTxt>
        </NullContainer>
      ) : (
        <Container contentContainerStyle={{ paddingBottom: insets.bottom }}>
          {data.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              status={item.status}
              date={item.date}
              idx={item.idx}
            />
          ))}
        </Container>
      )}
    </View>
  );
};

export default InquiryView;
