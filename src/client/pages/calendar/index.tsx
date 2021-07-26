import React, { useState } from "react";
import "./index.scss";
import { Calendar } from "tea-component";


export const CalendarComponent = (): JSX.Element => {
  return (
    <Calendar
      onChange={value => console.log(value.format("YYYY/MM/DD"), value)}
    />
  );
};
