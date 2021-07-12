import { useEffect, useState, useRef } from 'react';

export type DialogRef<S extends any = any> = React.MutableRefObject<{
  open: (arg?: Partial<S>) => void;
}>;

export function useDialogRef<S extends any = any>() {
  const dialogRef = useRef<{
    open: (arg?: Partial<S>) => void;
  }>({
        // 默认值
        open: () => {},
      });
  return dialogRef;
}

export function useDialog<S extends {}>(
  dialogRef: DialogRef,
  initDialogData?: Partial<S>,
  mergeFn?: (defaultVal: Partial<S>, initVal: Partial<S>) => Partial<S>,
) {
  const [visible, setShowState] = useState(false);

  const [defaultVal, setDefaultVal] = useState<S>(initDialogData as S);

  useEffect(() => {
    // eslint-disable-next-line no-param-reassign
    dialogRef.current = {
      open: (initVal?: Partial<S>) => {
        if (initVal) {
          const mergedData: Partial<S> = mergeFn
            ? mergeFn(defaultVal, initVal)
            : initVal;

          setDefaultVal(mergedData as S);
        }
        setShowState(true);
      },
    };
  }, [defaultVal, dialogRef, mergeFn, setDefaultVal]);

  return [visible, setShowState, defaultVal] as const;
}
