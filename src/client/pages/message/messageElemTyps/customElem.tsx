import React, { useEffect } from "react";

export const CustomElem = (props: any): JSX.Element => {
  console.log("props", props);

  const item = (props) => {
    const { custom_elem_data } = props;
    let data = custom_elem_data;
    try {
     data =  JSON.parse(custom_elem_data)
    }catch(err){

    }
    switch (data.businessID) {
      case "group_create":
        return (
          <>
            {data.opUser}
            {data.content}
          </>
        );
      default:
        return <>{JSON.stringify(props)}</>;
    }
  };

  return (
    <div className="message-view__item--text text right-menu-item">
      {item(props)}
    </div>
  );
};
