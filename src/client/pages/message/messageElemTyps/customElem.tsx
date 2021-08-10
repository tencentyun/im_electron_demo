import React from "react";
import withMemo from "../../../utils/componentWithMemo";

const CustomElem = (props: any): JSX.Element => {

                    custom_elem_data === 'CUST_EMOJI' ?
                       
                        <ImagePreview
                            previewSrc={custom_elem_desc}
                            previewTitle="预览"
                        >
                            {open => <a onClick={open}> <img src={custom_elem_desc} style={{ maxWidth: 178 }} /></a>}
                        </ImagePreview>
                        : JSON.stringify(props)
                    
                }
            </div>
          }
        };

  return (
    <div className="message-view__item--text text right-menu-item">
      {item(props)}
    </div>
  );
};

export default withMemo(CustomElem);
