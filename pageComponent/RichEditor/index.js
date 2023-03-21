import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from 'ckeditor5-custom-build';
import { useEventListener, useControllableValue } from 'ahooks';
import { Tag } from 'antd';
import {getCurrentUser, getSessionId} from "@/utils/user";
import { useClientHeight } from '@/components/utils';
import constants, { CRM_PRE_SALE } from '@/utils/constants';
import styles from './index.less';

const { SERVER_PATH, MOCK_URL } = constants;
const RichEditor = forwardRef(({ draft = false, columns = [], row = {}, data, ...props }, ref) => {
  const contacts = useRef(null);
  const toolbarRef = useRef(null);
  // const [editorExample, setEditorExample] = useState(null);
  const [editorExample, setEditorExample] = useControllableValue(props);
  // const transformationsArr = useMemo(() => {
  //   const arr = [];
  //   columns.forEach(item => {
  //     if (draft) {
  //       arr.push({
  //         from: item.title,
  //         to: `[${item.title}]`,
  //       });
  //     } else {
  //       arr.push({
  //         from: item.title,
  //         to: getTagShowVal(item, row),
  //       });
  //     }
  //   });
  //   return arr;
  // }, [columns, row, draft]);
  const offsetHeight = useClientHeight(contacts?.current || {});

  useImperativeHandle(ref, () => ({ editorExample }));
  useEventListener(
    'dragstart',
    event => {
      const target = event.target.nodeType === 1 ? event.target : event.target.parentElement;
      const draggable = target.closest('[draggable]');

      event.dataTransfer.setData('text/plain', draggable.innerText);
      event.dataTransfer.setData('text/html', draggable.innerText);
      event.dataTransfer.setData('contact', draggable.dataset.json);

      event.dataTransfer.setDragImage(draggable, 0, 0);
    },
    { target: contacts },
  );

  return (
    <>
      <div className={styles['rich-editor']}>
        <ul className={styles['ul-box']} ref={contacts}>
          {columns.map(res => {
            const obj = { ...res, draft };
            if (!draft) {
              // 如果不是 draft，就需要重新设置 title
              obj.title = getTagShowVal(res, row);
            }

            return (
              <li
                key={res.dataIndex}
                className={styles['li-box']}
                draggable
                // 判断是不是 draft，如果是 draft，就不需要重新设置 title
                data-json={JSON.stringify(obj)}
              >
                <Tag><div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                  <section>{res.title}</section>
                  {draft ? null : <section style={{maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}} title={getTagShowVal(res, row)}>{getTagShowVal(res, row)}</section>}
                </div></Tag>
              </li>
            );
          })}
          <li className={styles['li-box']} draggable style={{color: '#1890ff'}} data-json={JSON.stringify({ title: '[明细]', dataIndex: 'name'})}>
            <Tag color='blue'>明细</Tag>
          </li>
        </ul>
        <div
          className={styles['ckeditor5-box']}
          style={{ height: `calc(100% - ${offsetHeight}px)` }}
        >
          <div className={styles['show-toolbar']} id="toolbar" ref={toolbarRef} />
          <div className={styles['show-container']}>
            <CKEditor
              // className={styles['show-container-editor']}
              editor={DecoupledEditor}
              config={{
                list: {
                  properties: {
                    styles: {
                      useAttribute: true,
                    },
                    startIndex: true,
                    reversed: true,
                  },
                },
                language: 'zh-cn',
                placeholder: '编辑相关文档！',
                typing: {
                  transformations: {
                    extra: [
                      // Add some custom transformations – e.g. for emojis.
                      { from: ':)', to: '🙂' },
                      { from: ':+1:', to: '👍' },
                      { from: ':tada:', to: '🎉' },
                      {
                        from: /(^|\s)(")([^"]*)(")$/,
                        to: [null, '«', null, '»'],
                      },
                      {
                        from: /([.?!] )([a-z])$/,
                        to: matches => [null, matches[1].toUpperCase()],
                      },

                      // Add some more transformations.
                      // ...transformationsArr,
                    ],
                  },
                },

                image: {
                  toolbar: [
                    'imageStyle:block',
                    'imageStyle:side',
                    '|',
                    'toggleImageCaption',
                    'imageTextAlternative',
                    '|',
                    'linkImage',
                  ],
                },
                // 图片上传配置
                simpleUpload: {
                  // The URL that the images are uploaded to.
                  // uploadUrl: `${SERVER_PATH}/${CRM_PRE_SALE}/preTemplatePrint/uploadPic`,
                  // 模拟接口
                  uploadUrl: `${SERVER_PATH}/${CRM_PRE_SALE}/preTemplatePrint/uploadPic`,

                  // Enable the XMLHttpRequest.withCredentials property.
                  withCredentials: true,

                  // Headers sent along with the XMLHttpRequest to the upload server.
                  headers: {
                    'x-sid': getSessionId(),
                    Authorization: getCurrentUser().accessToken || '',
                  },
                },
              }}
              data={data}
              onReady={editor => {
                const toolbarContainer = toolbarRef.current;
                toolbarContainer.appendChild(editor.ui.view.toolbar.element);
                setEditorExample(editor);
              }}
              onError={(_, { willEditorRestart }) => {
                if (willEditorRestart && editorExample) {
                  editorExample.ui.view.toolbar.element.remove();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
});

export function getTagShowVal(item, row) {
  const val = row[item?.dataIndex];
  const str = item.pRender ? item.pRender(val, row) : val;
  return String(str);
}

export default RichEditor;
