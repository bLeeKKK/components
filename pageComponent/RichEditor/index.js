import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from 'ckeditor5-custom-build';
import { useEventListener, useControllableValue } from 'ahooks';
import { Tag, Button } from 'antd';
import $ from 'jquery';
import { getCurrentUser, getSessionId } from '@/utils/user';
import { useClientHeight } from '@/components/utils';
import constants, { CRM_PRE_SALE } from '@/utils/constants';
import styles from './index.less';

const { SERVER_PATH } = constants;
const RichEditor = forwardRef(
  ({ draft = false, columns = [], row = {}, data, itemBtns = [], ...props }, ref) => {
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
          <div className={styles['rich-editor-tools']}>
            <div>
              <ul className={styles['ul-box']}>
                {itemBtns.map(res => (
                  <li key={res.title} className={styles['li-box']}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        res.renderHtmlToView(editorExample);
                      }}
                    >
                      {res.title}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <hr style={{ marigin: '0 0 8px 0' }} />
            <div>
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
                      <Tag>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <section>{res.title}</section>
                          {draft ? null : (
                            <section
                              style={{
                                maxWidth: 140,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={getTagShowVal(res, row)}
                            >
                              {getTagShowVal(res, row)}
                            </section>
                          )}
                        </div>
                      </Tag>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
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
                  fontColor: {
                    colors: [
                      {
                        color: 'rgb(0, 0, 0)',
                        label: 'Black',
                      },
                      {
                        color: 'rgb(230, 76, 76)',
                        label: 'Dim grey',
                      },
                      {
                        color: 'rgb(230, 153, 76)',
                        label: 'Grey',
                      },
                      {
                        color: 'rgb(230, 230, 76)',
                        label: 'Light grey',
                      },
                      {
                        color: 'rgb(153, 230, 76)',
                        label: 'White',
                      },
                    ],
                  },
                  fontBackgroundColor: {
                    colors: [
                      {
                        color: 'rgb(230, 76, 76)',
                        label: 'Red',
                      },
                      {
                        color: 'rgb(230, 153, 76)',
                        label: 'Orange',
                      },
                      {
                        color: 'rgb(230, 230, 76)',
                        label: 'Yellow',
                      },
                      {
                        color: 'rgb(153, 230, 76)',
                        label: 'Light green',
                      },
                      {
                        color: 'rgb(76, 230, 76)',
                        label: 'Green',
                      },
                      // More colors.
                      // ...
                    ],
                  },
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
                  if (!toolbarContainer) return;
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
  },
);

export function getTagShowVal(item, row) {
  const val = row[item?.dataIndex];
  const str = item.pRender ? item.pRender(val, row) : val;
  return String(str);
}

export default RichEditor;

// 内部样式转行内样式
export const translateStyle = (htmlStr, styleStr) => {
  // 解析样式
  const styleMap = [];
  const styleArr = styleStr.split('}');
  const $content = $(`<div>${htmlStr}</div>`);
  console.log(htmlStr);
  styleArr.forEach(item => {
    if (!item) return;
    const [key, val] = item.split('{');
    styleMap.push([key, val?.replace('\n', '')]);
  });
  styleMap.forEach(([key, value]) => {
    try {
      const $that = $content.find(key.trim());
      const oldStyle = $that.attr('style') || '';
      $that.attr('style', oldStyle + value.trim());
    } catch (error) {
      // console.log(error);
    }
  });

  $content.attr('a', 999);
  return $content.html();
};

// 富文本编辑器默认样式
export const styleText = `
:root {
    --ck-color-image-caption-background: rgb(247, 247, 247);
    --ck-color-image-caption-text: rgb(51, 51, 51);
    --ck-color-mention-background: rgba(153, 0, 48, 0.1);
    --ck-color-mention-text: rgb(153, 0, 48);
    --ck-color-table-caption-background: rgb(247, 247, 247);
    --ck-color-table-caption-text: rgb(51, 51, 51);
    --ck-highlight-marker-blue: rgb(114, 204, 253);
    --ck-highlight-marker-green: rgb(98, 249, 98);
    --ck-highlight-marker-pink: rgb(252, 120, 153);
    --ck-highlight-marker-yellow: rgb(253, 253, 119);
    --ck-highlight-pen-green: rgb(18, 138, 0);
    --ck-highlight-pen-red: rgb(231, 19, 19);
    --ck-image-style-spacing: 1.5em;
    --ck-inline-image-style-spacing: calc(var(--ck-image-style-spacing) / 2);
    --ck-todo-list-checkmark-size: 16px;
}

.ck-content code {
    background-color: rgba(199, 199, 199, 0.3);
    padding: .15em;
    border-radius: 2px;
}
.ck-content blockquote {
    overflow: hidden;
    padding-right: 1.5em;
    padding-left: 1.5em;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    border-left: solid 5px rgb(204, 204, 204);
}
.ck-content[dir="rtl"] blockquote {
    border-left: 0;
    border-right: solid 5px rgb(204, 204, 204);
}
.ck-content .text-tiny {
    font-size: .7em;
}
.ck-content .text-small {
    font-size: .85em;
}
.ck-content .text-big {
    font-size: 1.4em;
}
.ck-content .text-huge {
    font-size: 1.8em;
}
.ck-content .marker-yellow {
    background-color: var(--ck-highlight-marker-yellow);
}
.ck-content .marker-green {
    background-color: var(--ck-highlight-marker-green);
}
.ck-content .marker-pink {
    background-color: var(--ck-highlight-marker-pink);
}
.ck-content .marker-blue {
    background-color: var(--ck-highlight-marker-blue);
}
.ck-content .pen-red {
    color: var(--ck-highlight-pen-red);
    background-color: transparent;
}
.ck-content .pen-green {
    color: var(--ck-highlight-pen-green);
    background-color: transparent;
}
.ck-content .image.image_resized {
    max-width: 100%;
    display: block;
    box-sizing: border-box;
}
.ck-content .image.image_resized img {
    width: 100%;
}
.ck-content .image.image_resized > figcaption {
    display: block;
}
.ck-content .image-style-block-align-left,
.ck-content .image-style-block-align-right {
    max-width: calc(100% - var(--ck-image-style-spacing));
}
.ck-content .image-style-align-left,
.ck-content .image-style-align-right {
    clear: none;
}
.ck-content .image-style-side {
    float: right;
    margin-left: var(--ck-image-style-spacing);
    max-width: 50%;
}
.ck-content .image-style-align-left {
    float: left;
    margin-right: var(--ck-image-style-spacing);
}
.ck-content .image-style-align-center {
    margin-left: auto;
    margin-right: auto;
}
.ck-content .image-style-align-right {
    float: right;
    margin-left: var(--ck-image-style-spacing);
}
.ck-content .image-style-block-align-right {
    margin-right: 0;
    margin-left: auto;
}
.ck-content .image-style-block-align-left {
    margin-left: 0;
    margin-right: auto;
}
.ck-content p + .image-style-align-left,
.ck-content p + .image-style-align-right,
.ck-content p + .image-style-side {
    margin-top: 0;
}
.ck-content .image-inline.image-style-align-left,
.ck-content .image-inline.image-style-align-right {
    margin-top: var(--ck-inline-image-style-spacing);
    margin-bottom: var(--ck-inline-image-style-spacing);
}
.ck-content .image-inline.image-style-align-left {
    margin-right: var(--ck-inline-image-style-spacing);
}
.ck-content .image-inline.image-style-align-right {
    margin-left: var(--ck-inline-image-style-spacing);
}
.ck-content .image {
    display: table;
    clear: both;
    text-align: center;
    margin: 0.9em auto;
    min-width: 50px;
}
.ck-content .image img {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    min-width: 100%;
}
.ck-content .image-inline {
    display: inline-flex;
    max-width: 100%;
    align-items: flex-start;
}
.ck-content .image-inline picture {
    display: flex;
}
.ck-content .image-inline picture,
.ck-content .image-inline img {
    flex-grow: 1;
    flex-shrink: 1;
    max-width: 100%;
}
.ck-content .image > figcaption {
    display: table-caption;
    caption-side: bottom;
    word-break: break-word;
    color: var(--ck-color-image-caption-text);
    background-color: var(--ck-color-image-caption-background);
    padding: .6em;
    font-size: .75em;
    outline-offset: -1px;
}
.ck-content span[lang] {
    font-style: italic;
}
.ck-content .todo-list {
    list-style: none;
}
.ck-content .todo-list li {
    margin-bottom: 5px;
}
.ck-content .todo-list li .todo-list {
    margin-top: 5px;
}
.ck-content .todo-list .todo-list__label > input {
    -webkit-appearance: none;
    display: inline-block;
    position: relative;
    width: var(--ck-todo-list-checkmark-size);
    height: var(--ck-todo-list-checkmark-size);
    vertical-align: middle;
    border: 0;
    left: -25px;
    margin-right: -15px;
    right: 0;
    margin-left: 0;
}
.ck-content .todo-list .todo-list__label > input::before {
    display: block;
    position: absolute;
    box-sizing: border-box;
    content: '';
    width: 100%;
    height: 100%;
    border: 1px solid rgb(51, 51, 51);
    border-radius: 2px;
    transition: 250ms ease-in-out box-shadow, 250ms ease-in-out background, 250ms ease-in-out border;
}
.ck-content .todo-list .todo-list__label > input::after {
    display: block;
    position: absolute;
    box-sizing: content-box;
    pointer-events: none;
    content: '';
    left: calc( var(--ck-todo-list-checkmark-size) / 3 );
    top: calc( var(--ck-todo-list-checkmark-size) / 5.3 );
    width: calc( var(--ck-todo-list-checkmark-size) / 5.3 );
    height: calc( var(--ck-todo-list-checkmark-size) / 2.6 );
    border-style: solid;
    border-color: transparent;
    border-width: 0 calc( var(--ck-todo-list-checkmark-size) / 8 ) calc( var(--ck-todo-list-checkmark-size) / 8 ) 0;
    transform: rotate(45deg);
}
.ck-content .todo-list .todo-list__label > input[checked]::before {
    background: rgb(38, 171, 51);
    border-color: rgb(38, 171, 51);
}
.ck-content .todo-list .todo-list__label > input[checked]::after {
    border-color: rgb(255, 255, 255);
}
.ck-content .todo-list .todo-list__label .todo-list__label__description {
    vertical-align: middle;
}
.ck-content ol {
    list-style-type: decimal;
}
.ck-content ol ol {
    list-style-type: lower-latin;
}
.ck-content ol ol ol {
    list-style-type: lower-roman;
}

.ck-content ol ol ol ol {
    list-style-type: upper-latin;
}

.ck-content ol ol ol ol ol {
    list-style-type: upper-roman;
}

.ck-content ul {
    list-style-type: disc;
}

.ck-content ul ul {
    list-style-type: circle;
}

.ck-content ul ul ul {
    list-style-type: square;
}

.ck-content ul ul ul ul {
    list-style-type: square;
}

.ck-content .media {
    clear: both;
    margin: 0.9em 0;
    display: block;
    min-width: 15em;
}

.ck-content .page-break {
    position: relative;
    clear: both;
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ck-content .page-break::after {
    content: '';
    position: absolute;
    border-bottom: 2px dashed rgb(196, 196, 196);
    width: 100%;
}

.ck-content .page-break__label {
    position: relative;
    z-index: 1;
    padding: .3em .6em;
    display: block;
    text-transform: uppercase;
    border: 1px solid rgb(196, 196, 196);
    border-radius: 2px;
    font-family: Helvetica, Arial, Tahoma, Verdana, Sans-Serif;
    font-size: 0.75em;
    font-weight: bold;
    color: rgb(51, 51, 51);
    background: rgb(255, 255, 255);
    box-shadow: 2px 2px 1px rgb(0, 0, 0);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.ck-content .table {
    margin: 0.9em auto;
    display: table;
}

.ck-content .table table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    height: 100%;
    border: 1px double rgb(179, 179, 179);
}

.ck-content .table table td,
.ck-content .table table th {
    min-width: 2em;
    padding: .4em;
    border: 1px solid rgb(191, 191, 191);
}

.ck-content .table table th {
    font-weight: bold;
    background: rgba(0, 0, 0, 0.05);
}

.ck-content[dir="rtl"] .table th {
    text-align: right;
}

.ck-content[dir="ltr"] .table th {
    text-align: left;
}

.ck-content .table > figcaption {
    display: table-caption;
    caption-side: top;
    word-break: break-word;
    text-align: center;
    color: var(--ck-color-table-caption-text);
    background-color: var(--ck-color-table-caption-background);
    padding: .6em;
    font-size: .75em;
    outline-offset: -1px;
}

.ck-content .table .ck-table-resized {
    table-layout: fixed;
}

.ck-content .table table {
    overflow: hidden;
}

.ck-content .table td,
.ck-content .table th {
    position: relative;
}

.ck-content hr {
    margin: 15px 0;
    height: 4px;
    background: rgb(222, 222, 222);
    border: 0;
}

.ck-content pre {
    padding: 1em;
    color: rgb(53, 53, 53);
    background: rgb(199, 199, 199, 0.3);
    border: 1px solid rgb(196, 196, 196);
    border-radius: 2px;
    text-align: left;
    direction: ltr;
    tab-size: 4;
    white-space: pre-wrap;
    font-style: normal;
    min-width: 200px;
}

.ck-content pre code {
    background: unset;
    padding: 0;
    border-radius: 0;
}

.ck-content .mention {
    background: var(--ck-color-mention-background);
    color: var(--ck-color-mention-text);
}
@media print {
    
    .ck-content .page-break {
        padding: 0;
    }
    
    .ck-content .page-break::after {
        display: none;
    }
}`;
