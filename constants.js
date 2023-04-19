// export const DEVELOPER_ENV = 'true'; // process.env.NODE_ENV === 'development' ? 'true' : 'false';

// 权限控制
export const DEVELOPER_ENV = process.env.NODE_ENV === 'development' ? 'true' : 'false';

const domain = window.top.location.href;
//  责任部门根节点id
export const ACCOUNTABILITY_ID = domain.includes('changhong')
  ? '9D1E3159-B2F3-11EA-A328-0242C0A84408'
  : '37702411-81A0-11ED-82E5-0242AC14001C';
