export type SupportedLanguage =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'python'
  | 'markdown';

export interface CodeFile {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
  folder?: string;
  isModified?: boolean;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  children: (FolderNode | CodeFile)[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: CodeFile[];
  folders: string[]; // List of folder paths, e.g. ["assets", "assets/images", "src"]
  createdAt: number;
  updatedAt: number;
  buildOutputs?: string[];
}

export interface LintError {
  id: string;
  fileId: string;
  fileName: string;
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  codeSnippet?: string;
}

export interface ConsoleLog {
  id: string;
  timestamp: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  line?: number;
  fileName?: string;
}

export type DeviceMode = 'pc' | 'tablet' | 'mobile' | 'responsive';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  image?: {
    data: string;
    mimeType: string;
    name: string;
  };
  fileUpdates?: {
    name: string;
    content: string;
    language: SupportedLanguage;
    action: 'create' | 'update' | 'delete';
  }[];
  suggestedNextSteps?: string[];
  executingSteps?: string[];
  thoughtProcess?: string;
}

export interface AgentProcessState {
  status: 'idle' | 'executing' | 'completed' | 'error';
  currentAction: string;
  steps: string[];
  completedSteps: number;
  displayRequest?: string;
}

export interface BuildConfig {
  mobile: {
    apk: boolean;
    aab: boolean;
    ipa: boolean;
    packageName: string;
    version: string;
    androidSdkKey: string;
  };
  desktop: {
    windowsExe: boolean;
    windowsMsi: boolean;
    macAppImage: boolean;
    linuxDeb: boolean;
    appName: string;
    version: string;
    signToken: string;
  };
}

export interface PlatformConfig {
  // Mobile Outputs Signing
  androidKeystore: string;
  appleDevCert: string;

  // Desktop Outputs Signing
  windowsSignKey: string;
  macDeveloperId: string;

  // Online File Saving & Project Hosting
  githubToken: string;
  githubRepo: string;
  vercelToken: string;
  vercelProjectId: string;
  cloudStorageKey: string;
  cloudBucket: string;

  // AI Chat Bot Configuration
  geminiApiKey: string;
  aiModel: string;
  customApiEndpoint: string;
}
