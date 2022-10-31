import React from 'react';


export default function TitleBox({ title }) {
  return <>
    {title && <h3>{title}</h3>}
  </>
}