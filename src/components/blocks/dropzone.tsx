'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, File, Loader2, Upload, X } from 'lucide-react';
import { useDropzone, type DropzoneProps, type FileWithPath, type FileRejection, type FileError } from 'react-dropzone';
import { useCallback, useRef, useState, useContext, createContext } from 'react';

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB'
) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (bytes === 0 || bytes === undefined) return size !== undefined ? `0 ${size}` : '0 bytes';
  const i = size !== undefined ? sizes.indexOf(size) : Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))  } ${  sizes[i]}`;
};

// Add className to Dropzone's props
interface CustomDropzoneProps extends Omit<DropzoneProps, 'children'> {
  className?: string;
  children?: React.ReactNode;
  getRootProps?: (props?: React.HTMLAttributes<HTMLElement>) => React.HTMLAttributes<HTMLElement>;
  getInputProps?: (props?: React.InputHTMLAttributes<HTMLInputElement>) => React.InputHTMLAttributes<HTMLInputElement>;
}

// Define the DropzoneContextType interface
interface DropzoneContextType {
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  onUpload: () => void;
  loading: boolean;
  successes: string[];
  errors: { name: string; message: string }[];
  maxFileSize: number;
  maxFiles: number;
  isSuccess: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  isDragActive: boolean;
  isDragReject: boolean;
}

// Create a context for Dropzone state
const DropzoneContext = createContext<DropzoneContextType | null>(null);

// Extend FileWithPath to include preview and errors
type DropzoneFile = FileWithPath & {
  preview: string;
  errors: { message: string }[];
};

const Dropzone = ({
  className,
  children,
  ...restProps
}: CustomDropzoneProps) => {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: FileWithPath[], fileRejections: FileRejection[]) => {
    setFiles(acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        errors: [],
      })
    ));
    setErrors(fileRejections.map((rej) => ({
      name: rej.file.name,
      message: rej.errors.map((e: FileError) => e.message).join(', '),
    })));
    setIsSuccess(false);
    setSuccesses([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    ...restProps,
    onDrop,
  });

  // Provide all necessary context values
  const contextValue = {
    files,
    setFiles,
    onUpload: () => {},
    loading: false,
    successes,
    errors,
    maxFileSize: restProps.maxSize ?? Number.POSITIVE_INFINITY,
    maxFiles: restProps.maxFiles ?? 1,
    isSuccess,
    inputRef,
    isDragActive,
    isDragReject,
  };

  return (
    <DropzoneContext.Provider value={contextValue}>
      <div
        {...getRootProps({
          className: cn(
            'border-2 border-dashed border-white/30 rounded-xl p-6 text-center bg-black/20 transition-all duration-300 text-white cursor-pointer',
            className,
            contextValue.isSuccess ? 'border-solid border-green-500/50 bg-green-500/10' : 'border-dashed',
            isDragActive && 'border-red-400/60 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-amber-500/10',
            ((isDragActive && isDragReject) ||
              (errors.length > 0 && !contextValue.isSuccess) ||
              files.some((file) => file.errors && file.errors.length !== 0)) && 'border-red-500/50 bg-red-500/10'
          ),
        })}
      >
        <input {...getInputProps()} ref={inputRef} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};

const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
  } = useDropzoneContext();

  const exceedMaxFiles = files.length > maxFiles;

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName));
    },
    [files, setFiles]
  );

  if (isSuccess) {
    return (
      <div className={cn('flex flex-row items-center gap-x-2 justify-center', className)}>
        <CheckCircle size={16} className="text-green-500" />
        <p className="text-green-500 text-sm">
          Successfully uploaded {files.length} file{files.length > 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {files.map((file) => {
        const fileError = errors.find((e) => e.name === file.name);
        const isSuccessfullyUploaded = !!successes.find((e) => e === file.name);

        return (
          <div
            key={`${file.name}-${file.lastModified}`}
            className="flex items-center gap-x-4 border-b border-white/10 py-2 first:mt-4 last:mb-4"
          >
            {file.type.startsWith('image/') ? (
              <div className="h-10 w-10 rounded border border-white/20 overflow-hidden shrink-0 bg-black/40 flex items-center justify-center">
                <img src={file.preview} alt={file.name} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded border border-white/20 bg-black/40 flex items-center justify-center">
                <File size={18} className="text-white/60" />
              </div>
            )}

            <div className="shrink grow flex flex-col items-start truncate">
              <p title={file.name} className="text-sm text-white truncate max-w-full">
                {file.name}
              </p>
              {file.errors.length > 0 ? (
                <p className="text-xs text-red-400">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith('File is larger than')
                        ? `File is larger than ${formatBytes(maxFileSize, 2)} (Size: ${formatBytes(file.size, 2)})`
                        : e.message
                    )
                    .join(', ')}
                </p>
              ) : loading && !isSuccessfullyUploaded ? (
                <p className="text-xs text-white/60">Uploading file...</p>
              ) : fileError ? (
                <p className="text-xs text-red-400">Failed to upload: {fileError.message}</p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-xs text-green-400">Successfully uploaded file</p>
              ) : (
                <p className="text-xs text-white/60">{formatBytes(file.size, 2)}</p>
              )}
            </div>

            {!loading && !isSuccessfullyUploaded && (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 justify-self-end text-white/60 hover:text-white h-6 w-6 p-0"
                onClick={() => handleRemoveFile(file.name)}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        );
      })}
      {exceedMaxFiles && (
        <p className="text-sm text-left mt-2 text-red-400">
          You may upload only up to {maxFiles} files, please remove {files.length - maxFiles} file
          {files.length - maxFiles > 1 ? 's' : ''}.
        </p>
      )}
      {files.length > 0 && !exceedMaxFiles && (
        <div className="mt-2">
          <Button
            variant="outline"
            onClick={onUpload}
            disabled={files.some((file) => file.errors.length !== 0) || loading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload files</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const DropzoneEmptyState = ({ className }: { className?: string }) => {
  const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext();

  if (isSuccess) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-y-2', className)}>
      <Upload size={20} className="text-white/60" />
      <p className="text-sm text-white/90 font-medium">
        <span className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
          Click to upload or drag and drop
        </span>
      </p>
      <div className="flex flex-col items-center gap-y-1">
        <p className="text-xs text-white/60">
          Drag and drop or{' '}
          <a
            onClick={() => inputRef.current?.click()}
            className="underline cursor-pointer transition hover:text-white"
          >
            select {maxFiles === 1 ? `file` : 'files'}
          </a>{' '}
          to upload
        </p>
        {maxFileSize !== Number.POSITIVE_INFINITY && (
          <p className="text-xs text-white/50">
            Maximum file size: {formatBytes(maxFileSize, 2)}
          </p>
        )}
      </div>
    </div>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);

  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }

  return context;
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };