// docs.types.ts

export interface DocBlock {
  type: string;
  // blocks are heterogeneous (heading/paragraph/image/list/note/divider/...),
  // so we keep this permissive and let consumers narrow by `type`.
  [key: string]: unknown;
}

export interface DocSection {
  id: string;
  title: string;
  subtitle?: string;
  blocks: DocBlock[];
}

export interface DocIndexSectionRef {
  id: string;
  title: string;
}

export interface DocIndexGroup {
  name: string;
  sections: DocIndexSectionRef[];
}

export interface DocIndex {
  id: string;
  name: string;
  version: string;
  created_on: string;
  groups: DocIndexGroup[];
}

export interface GetDocIndexResponse {
  success: true;
  index: DocIndex;
}

export interface GetDocSectionResponse {
  success: true;
  index?: DocIndex;
  section: DocSection;
}

export interface DocsErrorResponse {
  success: false;
  message: string;
}