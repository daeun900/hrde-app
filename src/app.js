import React from "react";
import { StatusBar } from "react-native";
import { ThemeProvider } from "styled-components/native";
import {theme} from './theme'
import Navigation from "./navigations";
import { UserProvider } from "./context/userContext";
import { LectureProvider } from "./context/lectureContext";
import { DomainProvider } from "./context/domaincontext";

const App = () => {
    return (
    <DomainProvider>
        <UserProvider>
            <LectureProvider>
                <ThemeProvider theme={theme}>
                    <StatusBar backgroundColor={theme.background} barStyle="dark-content"/>
                    <Navigation/>
                </ThemeProvider>
            </LectureProvider>
        </UserProvider>
    </DomainProvider>
    )
}

export default App