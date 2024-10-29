import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components/native";
import { Text, View, FlatList, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Video } from 'expo-av';
import { useDomain } from "../context/domaincontext";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHTML from 'react-native-render-html';

const Title = styled.Text`
  font-weight: 900;
  background-color: #F8F8F8;
  padding: 20px 25px;
  font-size: 16px;
`;

const SubTitle = styled.Text`
  padding: 20px 25px;
  background-color: #fff;
`;

const TabContainer = styled.FlatList`
  background-color: #fff;
`;

const TabButton = styled.TouchableOpacity`
  padding: 20px 0;
  width: 100px;
`;

const TabText = styled.Text`
  font-size: 16px;
  text-align: center;
  color: ${props => (props.active ? '#333' : '#ccc')};
`;

const ContentContainer = styled.View`
  flex: 1;
  background-color: #fff;
`;

const Detail = styled.View`
  padding: 25px;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: #eee;
`;

const ListItem = styled.View`
  width: 100%;
  padding-right: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Num = styled.Text`
  margin-right: 10px;
  padding-top: 5px;
`;

const SmallTxt = styled.Text`
  font-size: 15px;
  line-height: 25px;
`;

const BtnWrap = styled.View`
  background-color: #000;
  flex-direction: row;
`
const PrevBtn = styled.TouchableOpacity`
  width: 40%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  margin: 15px 0;
`
const PlayBtn = styled.TouchableOpacity`
  width: 20%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  margin: 15px 0;
`
const NextBtn = styled.TouchableOpacity`
  width: 40%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  margin: 15px 0;
`

const BtnTxt = styled.Text`
    font-size: 16px;
    color: #fff;
    margin: 0 10px;
`

const LoaderContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  justify-content: center;
  align-items: center;
  background-color: #333;
`;


const LecturePlayer = () => {
  const insets = useSafeAreaInsets(); // 아이폰 노치 문제 해결
  const route = useRoute();
  const { LectureCode, StudySeq, ChapterSeq, ContentsIdx, PlayMode, ProgressStep } = route.params; //학습정보 가져오기
  const [activeTab, setActiveTab] = useState('tab1');
  const [loading, setLoading] = useState(true); 
  const { domain } = useDomain();

  const tabs = [
    { key: 'tab1', title: '학습시간' },
    { key: 'tab2', title: '내용전문가' },
    { key: 'tab3', title: '차시목표' },
    { key: 'tab4', title: '훈련내용' },
    { key: 'tab5', title: '학습활동' }
  ];

  const [ContentsName, setContentsName] = useState('');
  const [contentsTitle, setContentsTitle] = useState('');
  const [Professor, setProfessor] = useState('');
  const [Expl01, setExpl01] = useState('');
  const [Expl02, setExpl02] = useState('');
  const [Expl03, setExpl03] = useState('');
  const [chapterNum, setChapterNum] = useState('');
  const [contentsDetailSeq, setContentsDetailSeq] = useState('');
  const [completeTime, setCompleteTime] = useState('');
  const [contentsMobilePage, setContentsMobilePage] = useState(''); // 총 페이지 수
  const [contentsMobileNowPage, setContentsMobileNowPage] = useState(1); // 현재 페이지
  const [playPath, setPlayPath] = useState(''); // 영상 url

  const [userId, setUserId] = useState('');

  const [lastStudy, setLastStudy] = useState(''); //재생중인 차시
 //const [playURL, setPlayURL] = useState(''); //재생중인 차시

  const navigation = useNavigation();

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

  ///////////////////////////////서버에서 영상 데이터 받아오기///////////////////////////////
  useEffect(() => { 
    getUserId();
    const fetchData = async () => { 
      if (!userId) return;  // userId가 없으면 fetchData 실행하지 않음
      try {
        const modifiedProgressStep = ProgressStep.replace('차시', ''); // "차시" 제거

        const response = await axios.post(`${domain}/mobile/player.php`, {
          id: userId,
          lectureCode: LectureCode,
          studySeq: StudySeq,
          chapterSeq: ChapterSeq,
          contentsIdx: ContentsIdx,
          playMode: PlayMode,
          progressStep: modifiedProgressStep
        });
        console.log('Player 보낸 데이터:', userId, LectureCode, StudySeq, ChapterSeq, ContentsIdx, PlayMode, modifiedProgressStep)

        const data = response.data;
        setContentsName(data.contentsName); //과정명
        setContentsTitle(data.contentsTitle); //차시명
        setPlayPath(data.playPath); //동영상url
        setProfessor(data.professor);//강사명
        setExpl01(data.exp01)//차시목표
        setExpl02(data.exp02)//훈련내용
        setExpl03(data.exp03)//학습활동
        setChapterNum(data.chapterNum);
        setContentsDetailSeq(data.contentsDetailSeq); 
        setCompleteTime(data.completeTime);
        setStudyTime(data.studyTime);
        setContentsMobilePage(data.contentsMobilePage); //총 페이지 수
        
        console.log('Player 받은 데이터:', response.data)
        setTimeout(() => {

        /////////////////////////////////////////// 본인인증 관련 로직  ///////////////////////////////////////////////////
        if (data.needMobileAuth === 'Y') {
          Alert.alert(
            '본인인증 필요', 
            '과정입과 시 본인인증이 필요합니다.', 
            [
              { text: '확인', onPress: () => navigation.navigate('LectureCerti', { 
                Id: userId,
                LectureCode: LectureCode,
                StudySeq: StudySeq,
                ChapterSeq: ChapterSeq,
                ContentsIdx: ContentsIdx,
                PlayMode: PlayMode,
                ProgressStep: modifiedProgressStep,

                ContentsName: data.contentsName, 
                UserName: data.name,  
                UserMobile: data.userMobile,
                SessionId: data.sessionId, 
                AgtId: data.captcha_agent_id, 
                SessionId: data.sessionId, 
                UserIp: data.userIP, 
                LectureTermeIdx: data.lectureTermeIdx,
                EvalCd: data.evalCd,
                EvalType: data.evalType,
                ChapterNumberZero: data.chapterNumberZero,

                TrnId:data.trnID
              }) }
            ],
            { cancelable: false }
          );
        } else if (data.needMobileAuth2 === "Y") {
   
          Alert.alert(
            '본인인증 필요', 
            '학습 진행 시 본인인증이 필요합니다.', 
            [
              { text: '확인', onPress: () => navigation.navigate('LectureCerti', { 
                Id: userId,
                LectureCode: LectureCode,
                StudySeq: StudySeq,
                ChapterSeq: ChapterSeq,
                ContentsIdx: ContentsIdx,
                PlayMode: PlayMode,
                ProgressStep: modifiedProgressStep,

                ContentsName: data.contentsName, 
                UserName: data.name,  
                UserMobile: data.userMobile,
                SessionId: data.sessionId, 
                AgtId: data.captcha_agent_id, 
                UserIp: data.userIP, 
                LectureTermeIdx: data.lectureTermeIdx,
                EvalCd: data.evalCd,
                EvalType: data.evalType,
                ChapterNumberZero: data.chapterNumberZero,

                ChapterNum: data.chapterNum
               }) }
            ],
            { cancelable: false }
          );
        }

        // 차시 수강 제한 경고
        if (data.alert === 'over8Chapters') {
          Alert.alert(
            '경고', 
            '하루 8개 차시까지만 수강이 가능합니다.', 
            [
              { text: '확인', onPress: () => navigation.goBack() } 
            ],
            { cancelable: false }
          );
        }
      }, 300);

        console.log('Video URL:', data.playPath)
        console.log('Study Time:', data.studyTime)
        //console.log('Last Study:', data.lastStudy)

        setLoading(false);

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(true);
      } 
    };

    fetchData();
  }, [userId, LectureCode, StudySeq, ChapterSeq, ContentsIdx, PlayMode, ProgressStep]);


////////////////////////////////////////////// 학습시간 체크 //////////////////////////////////////////////////////////////\
const [isPlaying, setIsPlaying] = useState(false);
const [studyTime, setStudyTime] = useState(0); //저장된 학습시간
const [formattedTime, setFormattedTime] = useState('00:00:00'); //저장된 학습시간

useEffect(() => {
  let timer;

  if (isPlaying) {
    timer = setInterval(() => {
      setStudyTime((prevTime) => {
        const currentTime = parseInt(prevTime, 10); // 문자열을 숫자로 변환
        const newTime = currentTime + 1; // 1초 추가
        setFormattedTime(formatTime(newTime));
        
        // 업데이트된 studyTime을 서버로 전송
        sendStudyTimeToServer(newTime);

        return newTime;
      });
    }, 1000);
  } else {
    clearInterval(timer);
  }

  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}, [isPlaying]);

    // 진도정보를 서버로 전송
    const sendStudyTimeToServer = async (time) => {
      try {
        const requestData = {
          id: userId,
          chapterNumber: chapterNum,
          lectureCode: LectureCode,
          studySeq: StudySeq,
          chapterSeq: ChapterSeq,
          contentsIdx: ContentsIdx,
          contentsDetailSeq: contentsDetailSeq,
          progressTime: time,
          lastStudy: lastStudy,
          completeTime: completeTime,
          progressStep: ProgressStep,
        };
    
        // 전송할 데이터 콘솔에 출력
        console.log('Sending the following data to the server:', requestData);
    
        const response = await axios.post(`${domain}/mobile/store_progress.php`, requestData);
    
        // 서버 응답 확인
        if (response.data.alert === 'Y') {
          console.log('Study time successfully sent and stored:', time, lastStudy); //퍼센트 단위로 변할때만 저장됨
        }
      } catch (error) {
        console.error('Error config:', error.config);
      }
    };
    
    
    //학습시간 display
    const formatTime = (time) => {
      let curmin = Math.floor(time / 60);
      let cursec = time % 60;
      let curhour = Math.floor(curmin / 60);
      curmin = curmin % 60;

      let curhour2 = (curhour < 10) ? '0' + curhour : curhour;
      let curmin2 = (curmin < 10) ? '0' + curmin : curmin;
      let cursec2 = (cursec < 10) ? '0' + cursec : cursec;

      return `${curhour2}:${curmin2}:${cursec2}`;
    };

    //////////////////////////////////////////video 태그 관련 //////////////////////////////////////////////////

    const video = useRef(null);

    //영상 캐시
    const getVideoUrl = (playPath) => `${playPath}?t=${new Date().getTime()}`;

    //이전차시버튼
    const onPrevButtonPress = () => {
      let nextPage = contentsMobileNowPage - 1;

      const playPathArray = playPath.split('/');
      const fileName = playPathArray[playPathArray.length - 1];
      const fileNameSplit = fileName.split('.');
      const fileNameFirst = fileNameSplit[0];
      const fileNameFirstLeft = fileNameFirst.substr(0, fileNameFirst.length - 2);
  
      let nextFileName = nextPage > 9 ? `${fileNameFirstLeft}${nextPage}.mp4` : `${fileNameFirstLeft}0${nextPage}.mp4`;
      let nextPlayPath = playPath.replace(fileName, nextFileName);
  
      setContentsMobileNowPage(nextPage);
      setPlayPath(getVideoUrl(nextPlayPath)); 
    };
  
    //다음차시버튼
    const onNextButtonPress = () => {
      let nextPage = contentsMobileNowPage + 1;

      const playPathArray = playPath.split('/');
      const fileName = playPathArray[playPathArray.length - 1];
      const fileNameSplit = fileName.split('.');
      const fileNameFirst = fileNameSplit[0];
      const fileNameFirstLeft = fileNameFirst.substr(0, fileNameFirst.length - 2);
  
      let nextFileName = nextPage > 9 ? `${fileNameFirstLeft}${nextPage}.mp4` : `${fileNameFirstLeft}0${nextPage}.mp4`;
      let nextPlayPath = playPath.replace(fileName, nextFileName);
  
      setContentsMobileNowPage(nextPage);
      setPlayPath(getVideoUrl(nextPlayPath)); 
    };

    //영상재생 상태관리
    const [status, setStatus] = useState({});
    const [loadingVideo, setLoadingVideo] = useState(true); 

  // 비디오 로딩
    const handleLoadStart = () => {
      setLoadingVideo(true);
      setIsPlaying(false);
    }

    const handleReadyForDisplay = async () => {
      setLoadingVideo(false);  // 로딩 상태를 false로 설정
  
      // 비디오 로드 후 자동 재생
      if (video.current) {
        await video.current.setPositionAsync(0);
        await video.current.playAsync();  // 비디오 자동 재생
      }
    };

    const handlePlaybackStatusUpdate = (status) => {
      
      setStatus(status);
      if (status.isPlaying) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    
    //video width, height
    const screenWidth = Dimensions.get('window').width;
    const videoHeight = (screenWidth * 650) / 1200;

  return (
    <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
        <>
      <Title>[{ContentsName}]</Title>
      <SubTitle>[{contentsTitle}]</SubTitle>
      <View style={{position:'relative'}}>
        <Video
        ref={video}
        style={{ width: screenWidth, height:videoHeight }}
        source={{ uri: playPath }}  // 비디오 URL 설정
        useNativeControls  // 기본 플레이어 UI 사용
        resizeMode="contain"  // 비디오 화면 조정 모드
        isLooping={false}  // 반복 재생 여부
        shouldPlay={true} //자동재생 활성화
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}  // 재생 상태 업데이트
        onLoadStart={handleLoadStart}
        onReadyForDisplay={handleReadyForDisplay} //재생준비완료
      />
        {loadingVideo && (
        <LoaderContainer width={screenWidth} height={videoHeight}>
          <ActivityIndicator size="large" color="#ffffff" />
        </LoaderContainer>
          )}
        </View>
      <BtnWrap>
        <PrevBtn onPress={onPrevButtonPress}>
        {contentsMobileNowPage !== 1 && (
          <>
            <AntDesign name="arrowleft" size={20} color="white" />
            <BtnTxt>이전차시</BtnTxt>
          </>
          )}
        </PrevBtn>
        <PlayBtn>
          <Text style={{color:'#fff'}}>
            {contentsMobileNowPage}/{contentsMobilePage}
          </Text>
        </PlayBtn> 
        {Number(contentsMobileNowPage) !== Number(contentsMobilePage) && (
        <NextBtn onPress={onNextButtonPress}>
          <BtnTxt>다음차시</BtnTxt>
          <AntDesign name="arrowright" size={20} color="white" />
        </NextBtn>
        )}
      </BtnWrap>
      <View>
        <TabContainer
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TabButton onPress={() => setActiveTab(item.key)}>
              <TabText active={activeTab === item.key}>{item.title}</TabText>
            </TabButton>
          )}
          keyExtractor={item => item.key}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        <ContentContainer insets={insets}>
          <Detail>
            {activeTab === 'tab1' && 
              <Text style={{ color: '#F70101', fontSize: 20, textAlign: 'center', fontWeight: '600' }}>{formattedTime}</Text>
            }
            {activeTab === 'tab2' && 
            <SmallTxt style={{ textAlign: 'center' }}>{Professor}</SmallTxt>}
            {activeTab === 'tab3' && 
              <ListItem>
                <View style={{ flexDirection: 'row' }}>
                <RenderHTML 
                  contentWidth={screenWidth} 
                  source={{ html: Expl01 }}
                />
                </View>
              </ListItem>
            }
            {activeTab === 'tab4' && 
            <ListItem>
                <View style={{ flexDirection: 'row' }}>
                <RenderHTML 
                  contentWidth={screenWidth} 
                  source={{ html: Expl02 }}
                />
                </View>
            </ListItem>
            }
            {activeTab === 'tab5' && 
            <ListItem>
                <View style={{ flexDirection: 'row' }}>
                <RenderHTML 
                  contentWidth={screenWidth} 
                  source={{ html: Expl03 }}
                />
                </View>
            </ListItem>
            }
          </Detail>
        </ContentContainer>
      </ScrollView>
      </>
      )}
    </View>
  );
};

export default LecturePlayer;
