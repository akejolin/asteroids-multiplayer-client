import { create } from "domain";
import React, { useState, useEffect } from "react";
import Controls from '../controls'

import { setupFirebase } from "../utils/firebaseConfig";

type tUserType = 'NONE' | 'HOST' | 'VISITOR'
interface iProps {
  userType: tUserType
}
const Host = (props:iProps) => {

  return (<div />)
}