import React, { useContext, useState, useEffect, useCallback }  from "react";
import styled from "styled-components/native";
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopSec} from "../components";
import { UserContext } from "../context/userContext";
import { useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const Container = styled.ScrollView`
  padding: 25px;
  background-color: #fff;
  border-top-width: 1px;
  border-color: #ededed ;
`;
const SSmallTxt = styled.Text`
  font-size: 12px;
`

const SmallTxt = styled.Text`
  font-size: 14px;
`

const MidTxt = styled.Text`
  font-size:16px;`
const LectureDetailBox = styled.View`
`

const Title = styled.Text`
  font-size: 20px;
  font-weight: 500;
  line-height: 30px;
  margin-bottom: 10px;
`
const LectureDetailTxt = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 0 5px;
  margin-top: 15px;
`

const ProgressWrap = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin: 25px 0;
`

const ProgressBox = styled.View`
  border: 1px solid #eaeaea;
  border-radius: 16px;
  height: 100px;
  width: 28%;
  overflow: hidden;
`
const ProgressTitle = styled.View`
  width: 100%;
  background-color: #F8F8F8;
  padding: 10px 0;
  border-radius: 16px 16px 0 0;
  align-items: center;
`

const Progress =styled.View`
  width: 100%;
  height: 60px;
  background-color: #fff;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`

const Point = styled.Text`
  font-size: 18px;
  color: #f70101;
  font-weight: 500;
`

const Line = styled.View`
  width: 150%;
  margin-left: -25%;
  height: 5px;
  background-color: #f8f8f8;
`

const TabContainer = styled.View`
  flex-direction: row;
  width: 300px;
  margin:  25px auto;
  background-color: #F8F8F8;
  border-radius: 28px;
`;

const TabButton = styled.TouchableOpacity`
  padding: 20px 0;
  width: 50%;
  border-radius: 28px;
  background-color: ${props => (props.active ? '#008DF3' : 'transparent')};
`;

const TabText = styled.Text`
  font-size: 16px;
  text-align: center;
  color: ${props => (props.active ? '#fff' : '#333')};
`;

const ContentContainer = styled.View`
  border-top-width: 1px;
  border-color: #eee;
`;

const ListItem = styled.View`
  padding: 0 5px;
  border-bottom-width: 1px;
  border-color: #eee;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`
const Num = styled.Text`
  color: #A0A0A0;
  margin-right: 15px;
  font-size: 16px;
`

const YellowButton = styled.TouchableOpacity`
  background-color: #FFD600;
  border-radius: 30px;
  padding:  10px 15px;
  margin-bottom: 7px;
`

const LectureDetail = ({ navigation }) => {
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const {userNm} = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('tab1');
  const route = useRoute();
  const { Seq  } = route.params; //Seq값 가져오기
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(''); 
  const [downloadUri, setDownloadUri] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  //userID추출
  const getUserId = async () => {
    try {
      const idString = await AsyncStorage.getItem('userId');
      if (idString !== null) {
        const idObject = JSON.parse(idString);
        const userId = idObject.value;
        setUserId(userId);
      }
      console.log(userId)
    } catch (error) {
      console.error('Failed to fetch the user ID:', error);
    }
  };

 // 학습정보 가져오기 함수
 const fetchLectureDetail = async () => {
  try {
    const response = await axios.post('https://hrdelms.com/mobileTest/lecture_detail.php', { seq: Seq, id: userId });
    const fetchedData = response.data;
    console.log('Lecture Detail 받은 데이터:', fetchedData); // 데이터 확인
    setData(fetchedData);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  getUserId();
}, []);

// 페이지 포커스 될 때마다 데이터 갱신
useFocusEffect(
  useCallback(() => {
      setLoading(true); // 로딩 상태를 true로 설정
      fetchLectureDetail();
  }, [])
);

const downloadHwpFile = async (fileName) => {
  console.log('test')
  const uri = 'https://hrdelms.com/upload/Course/${fileName}'; // 다운로드할 HWP 파일의 URL
  const fileUri = FileSystem.documentDirectory + fileName; // 저장할 경로

  const callback = downloadProgress => {
    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    setDownloadProgress(progress);
  };

  const downloadResumable = FileSystem.createDownloadResumable(
    uri,
    fileUri,
    {},
    callback
  );

  try {
    const { uri } = await downloadResumable.downloadAsync();
    setDownloadUri(uri);

    // 파일을 공유 가능 여부 확인 후 공유
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      alert('파일을 열 수 없습니다. 한글 뷰어 앱이 필요합니다.');
    }
  } catch (error) {
    console.error(error);
    alert('파일 다운로드 실패');
  }
};

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>데이터를 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  return (
    <View insets={insets} style={{flex:1}}>
        <TopSec name={userNm}/>
        <Container contentContainerStyle={{ paddingBottom: insets.bottom + 20}}>
          <LectureDetailBox>
              <Title>{data.title}</Title>
              <LectureDetailTxt>
                  <Text style={{color:'#767676'}}>수강기간</Text>
                  <Text>{data.lectureStart} ~ {data.lectureEnd}</Text>
              </LectureDetailTxt>
              <LectureDetailTxt>
                  <Text style={{color:'#767676'}}>남은수강일</Text>
                  <Text>{data.daysLeft}일</Text>
              </LectureDetailTxt>
              <LectureDetailTxt>
                  <Text style={{color:'#767676'}}>내용전문가</Text>
                  <Text>{data.professor}</Text>
              </LectureDetailTxt>
              <ProgressWrap>
                  <ProgressBox style={{width: '40%'}}>
                      <ProgressTitle><Text>현재 진행상태</Text></ProgressTitle>
                      <Progress style={{flexDirection:'column'}}>
                        <Point>{data.classNum}</Point>
                        <SSmallTxt style={{color: '#767676'}}>
                          {data.classStatus.replace(/<br\s*\/?>/gi, ' ')}
                        </SSmallTxt>
                      </Progress>
                  </ProgressBox>
                  <ProgressBox>
                      <ProgressTitle><Text>강의진도</Text></ProgressTitle>
                      <Progress><Point>{data.progressNum}</Point><SSmallTxt>/{data.chapter}</SSmallTxt></Progress>
                  </ProgressBox>
                  <ProgressBox>
                      <ProgressTitle><Text>진도율</Text></ProgressTitle>
                      <Progress><Point>{data.progressPercent}</Point><SSmallTxt>%</SSmallTxt></Progress>
                  </ProgressBox>
              </ProgressWrap>
          </LectureDetailBox>
          <Line/>
          <TabContainer>
              <TabButton active={activeTab === 'tab1'} onPress={() => setActiveTab('tab1')}>
                <TabText active={activeTab === 'tab1'}>과정목록</TabText>
              </TabButton>
              <TabButton active={activeTab === 'tab2'} onPress={() => setActiveTab('tab2')}>
                <TabText active={activeTab === 'tab2'}>학습자료 다운로드</TabText>
              </TabButton>
          </TabContainer>
          <ContentContainer>
            {activeTab === 'tab1' && 
              data.chapterInfo.map((item, index) => (
              <ListItem key={index}>
                <View style={{flexDirection:'row', width: item[2] === 'Y' ? '65%' : '100%'}}> 
                    <Num>{index + 1}</Num>
                    <SmallTxt>{item[0]}</SmallTxt>
                </View>
                 <View style={{alignItems:'center'}}>
                 {item[2] === 'Y' && (
                    <>
                     <YellowButton 
                        onPress={() => {
                          const returnData = data.returnBack[index];
                          navigation.navigate("LecturePlayer", { 
                            LectureCode: returnData[0], 
                            StudySeq: returnData[1], 
                            ChapterSeq: returnData[2], 
                            ContentsIdx: returnData[3], 
                            // ProgressIdx: returnData[4], 
                            PlayMode: returnData[5], 
                            ProgressStep: returnData[6] 
                          });
                        }}
                      >
                      <SmallTxt style={{color:'#fff'}}>수강하기</SmallTxt>
                    </YellowButton>
                      <Text>
                        <MidTxt>{item[3]}</MidTxt>
                        <SSmallTxt>%</SSmallTxt>
                      </Text>
                    </>
                  )}
              </View>
              </ListItem>))
            }
            {activeTab === 'tab2' &&   
              <ListItem>
                <View style={{flexDirection:'row'}}> 
                    <Num>1</Num>
                    <SmallTxt>{data.attachFile}</SmallTxt>
                </View>
                <View style={{alignItems:'center'}}>
                    <YellowButton  onPress={() => downloadHwpFile(data.attachFile)} >
                      <SmallTxt style={{color:'#fff'}}>다운로드</SmallTxt>
                    </YellowButton>
                </View>
              </ListItem>
            }
          </ContentContainer>
        </Container>
    </View>
  );
};

export default LectureDetail;