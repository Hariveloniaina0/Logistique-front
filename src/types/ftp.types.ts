//src\types\ftp.types.ts
export interface FtpConfig {
  idFtp?: number;
  host: string;
  nomUtilisateur: string;
  motDePasseFtp: string;
  port: number;
  protocol: 'ftp' | 'sftp';
}

export interface FtpState {
  config: FtpConfig | null;
  isLoading: boolean;
  error: string | null;
}