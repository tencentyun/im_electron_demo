import React,{ Fragment  }from "react"
import { useDialogRef } from "../../utils/react-use/useDialog";
import { SearchBox } from "../searchBox/SearchBox"
import { SearchMessageModal } from "../searchMessage";

import "./index.scss";

export const SearchMessageAndFriends = (): JSX.Element => {
    const dialogRef = useDialogRef();
    const handleSearchBoxClick = () => dialogRef.current.open();
    
    return (
        <Fragment>
            <div className="search-wrap" onClick={handleSearchBoxClick}><SearchBox /></div>
            <SearchMessageModal dialogRef={dialogRef} />
        </Fragment>
    )
}