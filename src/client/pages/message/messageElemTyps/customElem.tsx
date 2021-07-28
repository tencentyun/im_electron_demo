import React, { useEffect } from "react";

export const CustomElem = (props: any): JSX.Element => {
  console.log("props", props);

  const item = (props) => {
    const { custom_elem_data } = props;
    const data = JSON.parse(custom_elem_data);
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
