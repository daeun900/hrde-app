import React from "react";
import { useState } from "react";
import styled from "styled-components/native";
import { useLectureContext } from "../context/lectureContext";
import { useNavigation } from '@react-navigation/native';
import { prevHandleLogout } from '../hooks/LogoutConfirmation'; 
import { MaterialIcons, Octicons } from '@expo/vector-icons';



const TopTxt = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 30px;
  background-color: #fff;
  border-bottom-width: ${(props) => props.borderBottomWidth || '1px'};
  border-color: #EDEDED;
`;

const BigTxt = styled.Text`
  font-size: 20px;
  line-height: 30px;
`;

const SmallTxt = styled.Text`
  font-size: 14px;
  line-height: 20px;
`;

const Name = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BtnWrap = styled.View`
  flex-direction: row;
`;

const LogoutBtn = styled.TouchableOpacity`
  padding: 8px;
`;

const NoticeBtn = styled.TouchableOpacity`
  padding: 8px;
  position: relative;
`;

const On = styled.View`
  position: absolute;
  top: 5px;
  right: 2px;
  width: 7px;
  height: 7px;
  border-radius: 50px;
  background-color: #F70101;
`;

const TopSec = ({ name, borderBottomWidth }) => {
  const { clearLectures } = useLectureContext();
  const navigation = useNavigation();

  return (
    <TopTxt borderBottomWidth={borderBottomWidth}>
      <Name>
        <BigTxt style={{ fontWeight: 600, marginRight: 3 }}>{name}</BigTxt>
        <SmallTxt>님</SmallTxt>
      </Name>
      <BtnWrap>
        <LogoutBtn onPress={() => prevHandleLogout(navigation)}>
          <MaterialIcons name="logout" size={24} color="black" />
        </LogoutBtn>
      </BtnWrap>
    </TopTxt>
  );
}

export default TopSec;
