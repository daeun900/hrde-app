import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLectureContext } from '../context/lectureContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLogoutConfirmation = () => {
  const navigation = useNavigation();
  const { clearLectures } = useLectureContext(); // context 가져오기

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      confirmLogout(navigation, clearLectures, unsubscribe); // navigation,clearLectures,unsubscribe 전달
    });

    return unsubscribe;
  }, [navigation, clearLectures]);
};

const confirmLogout = (navigation, clearLectures, unsubscribe) => {
  Alert.alert(
    '로그아웃',
    '로그아웃 하시겠습니까?',
    [
      {
        text: '취소',
        onPress: () => console.log('로그아웃 취소'),
        style: 'cancel',
      },
      {
        text: '확인',
        onPress: () => removeData(navigation, clearLectures, unsubscribe), // navigation,clearLectures,unsubscribe 전달
      },
    ],
    { cancelable: false }
  );
};

const removeData = async (navigation, clearLectures, unsubscribe) => {
  try {
    await AsyncStorage.removeItem('userNm');
    await AsyncStorage.removeItem('userId');
    console.log('Data removed');
    console.log('로그아웃 진행 후 userNm 값 : ', await AsyncStorage.getItem('userNm'));
    console.log('로그아웃 진행 후 userId 값 : ', await AsyncStorage.getItem('userId'));
    clearLectures(); // lectures 클리어
    unsubscribe(); // beforeRemove 리스너 해제
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }]
    });
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

export default useLogoutConfirmation;
