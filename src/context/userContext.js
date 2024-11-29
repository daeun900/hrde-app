import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userNm, setUserNm] = useState(''); // 사용자 이름
  const [userMb, setUserMb] = useState(''); // 전화번호
  const [userBd, setUserBd] = useState(''); // 생년월일

  const getData = async (key, setter) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        const { value, createdTime, expirationTime } = JSON.parse(jsonValue);

        // 현재 시간 구하기 (Unix 타임스탬프)
        const currentTimeStamp = Math.floor(Date.now() / 1000);

        // 만료 시간 확인
        if (currentTimeStamp < expirationTime) {
          console.log(`${key}`, value);
          setter(value); // 상태 변수에 할당
        } else {
          console.log(`${key} data has expired`);
        }
      } else {
        console.log(`No data stored for the key: ${key}`);
      }
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
    }
  };

  const updateUserData = async () => {
    await getData('userNm', setUserNm);
    await getData('userMb', setUserMb);
    await getData('userBd', setUserBd);
  };

  const updateUserNm = async () => {
    await getData('userNm', setUserNm);
  };

  const clearUserData = () => {
    setUserNm('');
    setUserMb('');
    setUserBd('');
    console.log('data expired')
  };
  
  return (
    <UserContext.Provider value={{ userNm, setUserNm, userMb, setUserMb, userBd, setUserBd, updateUserData, updateUserNm, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
