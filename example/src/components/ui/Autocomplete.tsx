// import classNames from 'classnames';
import React from 'react';
import { memo } from 'react';

export interface IAutoCompleteItem {
  id: string;
  name: string;
  iconUrl?: string;
  balance?: string;
}

// type Props = {
//   items: IAutoCompleteItem[];
//   value: string;
//   onChange(val: string): void;
//   disabled?: boolean;
//   placeholder?: string;
// };

//we are using dropdown, input and menu component from daisyui
export const Autocomplete = memo(() => {
  // const { items, value, onChange, disabled, placeholder } = props;
  // const ref = useRef<HTMLDivElement>(null);
  // const [open, setOpen] = useState(false);

  // const regex = RegExp(value, 'gi');

  return <></>;

  // return (
  //   <div
  //     // use classnames here to easily toggle dropdown open
  //     className={classNames({
  //       'dropdown w-full': true,
  //       'dropdown-open': open,
  //     })}
  //     ref={ref}
  //   >
  //     <input
  //       disabled={disabled}
  //       type="text"
  //       className="input input-bordered w-full"
  //       value={value}
  //       onChange={(e) => onChange(e.target.value)}
  //       placeholder={placeholder ?? 'Type something...'}
  //       tabIndex={0}
  //     />
  //     <div className="dropdown-content bg-base-200 top-14 max-h-96 overflow-auto flex-col rounded-md">
  //       <ul
  //         className="menu menu-compact "
  //         // use ref to calculate the width of parent
  //         style={{ width: ref.current?.clientWidth }}
  //       >
  //         {items
  //           .filter((item) => regex.test(item.name) || regex.test(item.id))
  //           .map((item, index) => {
  //             return (
  //               <li
  //                 key={index}
  //                 tabIndex={index + 1}
  //                 onClick={() => {
  //                   onChange(item.id);
  //                   setOpen(false);
  //                 }}
  //                 className="border-b border-b-base-content/10 w-full"
  //               >
  //                 <button>
  //                   <img width={32} height={32} src={item.iconUrl}></img>
  //                   {item.name} ({item.id}){' '}
  //                   {item.balance ? ` / Balance: ${item.balance}` : ''}
  //                 </button>
  //               </li>
  //             );
  //           })}
  //       </ul>
  //     </div>
  //   </div>
  // );
});
