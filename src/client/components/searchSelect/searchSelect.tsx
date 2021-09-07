import React from 'react';
import { Select, Spin } from 'antd';
import { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';
import {  filterGetStAffPrefix } from '../../utils/orgin'

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

// Usage of DebounceSelect
interface UserValue {
    label: string;
    value: string;
  }


const DebounceSelect = <
  ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps) =>{
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState<ValueType[]>([]);
  const fetchRef = React.useRef(0);
 
  
  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select<ValueType>
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}



const  fetchUserList =  async(username: string): Promise<UserValue[]> =>{
  console.log('fetching user', username);
  return new Promise((resolve) => {
    filterGetStAffPrefix({ Prefix:username,Limit:100 },(filterLoda)=>{
        resolve(filterLoda.map((item) => ({
            label: `${item.Uname} - ${item.DepName == "" ? "" : item.DepName.match(/[^\/]+/)[0]}`,
            value: item.Uid,
          })))
     },window.localStorage.getItem('uid'))
  })
}



export const EarchSelect = (props): JSX.Element=>{
    const [value, setValue] = React.useState<UserValue[]>([]);
    
    return (
        <DebounceSelect
          mode="multiple"
          value={props.value}
          disabled={props.disabled}
          placeholder="请搜索管理员"
          fetchOptions={fetchUserList}
          onChange={props.onChange}
          style={{ width: '100%' }}
        />
      );
}

