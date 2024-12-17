import React, { useEffect , useContext, useState, useRef} from "react";
import { StyleSheet, Platform,Text, View, Image, useWindowDimensions, ImageBackground, ActivityIndicator, AppState} from "react-native";
import styled from "styled-components/native";
import { TopSec, Carousel, ImageSliderModal} from "../components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';
import { UserContext } from "../context/userContext";
import { useLectureContext } from '../context/lectureContext';
import {useLogoutConfirmation} from "../hooks/LogoutConfirmation";
import { useDomain } from "../context/domaincontext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';

const Container = styled.ScrollView`
  padding: 0 20px;
`;

const BigTxt = styled.Text`
  font-size: 20px;
  line-height: 30px;
`
const MidTxt = styled.Text`
  font-size: 16px;
  line-height: 24px;
`
const SmallTxt = styled.Text`
  font-size: 14px;
  line-height: 20px;
`

const Name = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CarouselBox = styled.View`
  height:300px;
  overflow: visible;
  margin-left: -40px;
  margin-top: -20px;
`;

const LectureBox = styled.TouchableOpacity`
  width: 100%;
  height: 177px ;
  background-color: #FFD600;
  border-radius: 16px;
  padding:30px;
`;

const FlexBox = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`
const GridBtn = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
`
const SmallButton = styled.TouchableOpacity`
  padding: 20px;
  justify-content: space-between;
  margin-top: 10px;
  background-color: #fff;
  border-radius: 16px;
  width: 48%;
  height: 106px;
`
 
const BigButton = styled.TouchableOpacity`
  padding:0 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  background-color: #fff;
  border-radius: 16px;
  width: 100%;
  height: 62px;
`

const styles = StyleSheet.create({
  shadow:{
    ...Platform.select({
      ios: {
        shadowColor:"rgba(0,0,0)",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: {
          height: 5,
          width: 0
        }
        },
        android: {
          elevation: 2
        }
      })
    }
  })


const Home =  ({ navigation }) => {
  const { lectures , fetchLectureData, loading} = useLectureContext(lectures);
  const insets = useSafeAreaInsets(); //아이폰 노치 문제 해결
  const data = [{image: {uri: 'https://hrdelms.com/mobile/assets/banner1.png'}},{image:{uri: 'https://hrdelms.com/mobile/assets/banner2.png'}},{image: {uri: 'https://hrdelms.com/mobile/assets/banner3.png'}}]
  const {width} = useWindowDimensions();
  const { userNm, updateUserNm  } = useContext(UserContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const triggerLogout = useLogoutConfirmation();
  const { domain } = useDomain();

  const checkLoginStatus = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('userId');

      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        const currentTimeStamp = Math.floor(Date.now() / 1000); 
        const expirationTime = sessionData.expirationTime; 
  
        if (currentTimeStamp > expirationTime) {
          triggerLogout(true, '세션이 만료되었습니다. 다시 로그인해 주세요.')
          return;
        }
      }
      
      const response = await axios.post(`${domain}/mobile/sign_in_status.php`, {
      });
      handleLoginStatus(response.data.result,response.data.deviceId); 
    } catch (error) {
      console.error('로그인 상태 체크 오류:', error);
    }
  };


  // 디바이스 고유 ID 가져오기
  const getDeviceId = async () => {
  if (Device.isDevice) {
    return Device.osInternalBuildId || Device.modelId || 'unknown_device';
  }
  return 'unknown_device';
  };

  //자동로그아웃
  const handleLoginStatus = async (status,storedDeviceId) => {
    const deviceId = await getDeviceId();

    // deviceId가 변경되지 않았는지 확인
    const isDeviceUnchanged = storedDeviceId === `APP_${deviceId}`;
    console.log('test')
    //console.log(storedDeviceId,deviceId)
    //console.log(isDeviceUnchanged)

    if (status === 'Empty') {
      triggerLogout(true, '세션이 만료되어 로그아웃 처리됩니다.');
    } else if (status === 'N' &&  !isDeviceUnchanged) {
      triggerLogout(true, '다른 기기에서 로그인하여 로그아웃 처리됩니다.');
    }
  };

// 앱이 포그라운드로 돌아올 때 세션 상태 확인
  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') { 
        checkLoginStatus();
      }
    });
    return () => {
      appStateListener.remove();
    };
  }, []);

// 6초마다 세션 상태 확인
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkLoginStatus();
    }, 6000); 

    return () => clearInterval(intervalId); // 컴포넌트가 언마운트되면 interval 해제
  }, []);

  useEffect(() => {
    fetchLectureData(); 
    updateUserNm(); 
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };


 
 return (
    <ImageBackground 
    style={{ width: "100%", height: "100%" }}  //View를 꽉채우도록
    source={require("../../assets/main_bg.png")}  //이미지경로
    resizeMode="cover" // 'cover', 'contain', 'stretch', 'repeat', 'center' 중 선택 
    >
    <View insets={insets} style={{flex:1}}>
        <TopSec name={userNm} borderBottomWidth="0px"/>
        <Container contentContainerStyle={{ paddingBottom: insets.bottom + 20}}>
        {loading ? (  // 로딩 중일 때는 로딩 인디케이터 표시
            <ActivityIndicator size={40} color="#FFD600" />
          ) : (
            <>
            <CarouselBox style={{width:width}}>
                <Carousel data={data} />
            </CarouselBox>
            <LectureBox activeOpacity={.8} onPress={() => navigation.navigate("Lecture")}>
              <FlexBox>
                  <Image source={require('../../assets/profile_icon.png')} style={{marginRight:10}}/>
                  <View>
                    <Name name={userNm}>
                        <BigTxt style={{ fontWeight: 600, marginRight:3}} allowFontScaling={false}>{userNm}</BigTxt>
                        <SmallTxt>님</SmallTxt>
                    </Name>
                    <SmallTxt style={{fontSize:13}} numberOfLines={2}>나의 학습실에서 수강중인 과정을 확인하세요</SmallTxt>
                  </View>
              </FlexBox>
              <View style={{width:'100%', backgroundColor:'#rgba(255,255,255,.5)', paddingVertical: 13, borderRadius: 26}}>
                  <SmallTxt style={{textAlign:'center'}}>
                    회원님은 총 <Text style={{color:'#008DF3'}}>{lectures.length}개</Text>의 과정을 수강하고 있습니다.
                  </SmallTxt>
              </View>
            </LectureBox>
          <GridBtn>
            <SmallButton style={styles.shadow} activeOpacity={.8}  onPress={toggleModal}>
                <Image source={require('../../assets/main_icon1.png')}/>
                <MidTxt>앱 사용방법</MidTxt>
            </SmallButton>
            <SmallButton style={styles.shadow} activeOpacity={.8} onPress={() =>navigation.navigate('ETCcontainer', {screen: 'Faq'})}>
                <Image source={require('../../assets/main_icon2.png')}/>
                <MidTxt>자주 묻는 질문</MidTxt>
            </SmallButton>
          </GridBtn>
          <BigButton style={styles.shadow} activeOpacity={.8}  onPress={() =>navigation.navigate('ETCcontainer', {screen: 'Notice'})}>
              <Image source={require('../../assets/main_icon3.png')}/>
              <MidTxt>공지사항 바로가기</MidTxt>
              <MaterialIcons name="arrow-forward-ios" size={18} color="black" />
          </BigButton>
          <BigButton style={styles.shadow} activeOpacity={.8}   onPress={() =>navigation.navigate('CScontainer', {screen: 'CScenter'})}>
              <Image source={require('../../assets/main_icon4.png')}/>
              <MidTxt>고객센터 바로가기</MidTxt>
              <MaterialIcons name="arrow-forward-ios" size={18} color="black" />
          </BigButton>
          </>
          )}
        </Container>
        <ImageSliderModal isVisible={isModalVisible} onClose={toggleModal} />
       
      </View>
      </ImageBackground>
  );
};




export default Home;