import { zodResolver } from '@hookform/resolvers/zod';
import { CancelTokenSource } from 'axios';
import mammoth from 'mammoth';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormReturn, useForm } from 'react-hook-form';
import pdfToText from 'react-pdftotext';

import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { useToast } from '@/hooks/useToast';
import {
  UploadFileKnowledgeType,
  uploadFileKnowledgeSchema,
} from '@/models/knowledge-model';

import { Icons } from '../icons';
import { Accordion } from '../ui/accordion';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Form } from '../ui/form';
import { Input } from '../ui/input';

interface FileUploadProgress {
  progress: number;
  File: File;
  source: CancelTokenSource | null;
}

const PdfColor = {
  bgColor: 'bg-blue-400',
  fillColor: 'fill-blue-400',
};

export function UploadFileKnowledgeForm({
  knowledgeId,
}: {
  knowledgeId: string;
}) {
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const form = useForm<UploadFileKnowledgeType>({
    resolver: zodResolver(uploadFileKnowledgeSchema),
    defaultValues: {
      name: '',
      text: '',
    },
  });

  const { data: knowledge } = useApiQuery({
    service: 'knowledge',
    method: 'getById',
    apiLibraryArgs: {
      id: knowledgeId,
    },
  });

  const saveUploadedTextToKnowledgeMutation = useApiMutation({
    service: 'knowledge',
    method: 'saveUploadedTextToKnowledge',
    apiLibraryArgs: {
      knowledgeId: knowledgeId!,
    },
  });

  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const { toast } = useToast();

  const getFileIconAndColor = () => {
    return {
      icon: <Icons.file className={PdfColor.fillColor} />,
      color: PdfColor.bgColor,
    };
  };

  const removeFile = (file: File) => {
    setFilesToUpload((prevUploadProgress) => {
      return prevUploadProgress.filter((item) => item.File !== file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFilesToUpload((prevUploadProgress) => {
      return [
        ...prevUploadProgress,
        ...acceptedFiles.map((file) => {
          return {
            progress: 0,
            File: file,
            source: null,
          };
        }),
      ];
    });
  }, []);

  useEffect(() => {
    if (knowledge) {
      form.reset({
        name: '',
        text: '',
        chunkSize: knowledge.chunkSize,
        chunkOverlap: knowledge.chunkOverlap,
      });
    }
  }, [form, knowledge]);

  const onSubmit = useCallback(async () => {
    setUploadStatus('loading');

    if (filesToUpload.length === 0) {
      toast({ title: 'No file to upload', variant: 'destructive' });
      setUploadStatus('error');
      return;
    }

    //Only supporting one file upload at a time
    const file = filesToUpload.map(
      (fileUploadProgress) => fileUploadProgress.File,
    )[0];

    let text: string;

    try {
      text = await extractDataFromDocument(file);
    } catch (error) {
      setUploadStatus('error');
      toast({ title: (error as any).message, variant: 'destructive' });
      return;
    }

    await saveUploadedTextToKnowledgeMutation.mutateAsync(
      {
        data: {
          name: form.getValues('name'),
          text: text,
          chunkSize: form.getValues('chunkSize'),
          chunkOverlap: form.getValues('chunkOverlap'),
        },
      },
      {
        onSuccess: () => {
          setUploadStatus('success');
          toast({
            title: 'Data is being processed.',
            variant: 'default',
          });
        },
        onError: () => {
          setUploadStatus('error');
        },
      },
    );
  }, [filesToUpload, form, saveUploadedTextToKnowledgeMutation, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 10485760, // 10 MB in bytes
  });

  if (!knowledge) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        {uploadStatus === 'success' ? (
          <SuccessFormContent />
        ) : uploadStatus === 'error' ? (
          <ErrorFormContent />
        ) : (
          <>
            <Form.Header className="pb-5">
              <Form.Title>New Data</Form.Title>
              <Form.Subtitle>
                Add your own data to your knowledge notebook
              </Form.Subtitle>
            </Form.Header>
            <Form.Content className="space-y-6">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Name</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Add a name" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {uploadStatus === 'loading' ? (
                <div className="flex flex-col items-center pt-4 pb-10">
                  <Icons.spinner className="animate-spin size-8 text-primary" />
                </div>
              ) : (
                <div>
                  {filesToUpload.length === 0 ? (
                    <div>
                      <label
                        {...getRootProps()}
                        className="relative flex flex-col items-center justify-center w-full py-6 border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted"
                      >
                        <div className="text-center space-y-1">
                          <div className="border p-2 rounded-md max-w-min mx-auto">
                            <Icons.uploadFile />
                          </div>

                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-semibold">
                              Drag & Drop file
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Click to upload file &#40;file should be under 10 MB
                            &#41;
                          </p>
                        </div>
                      </label>

                      <Input
                        {...getInputProps()}
                        id="dropzone-file"
                        accept=".pdf, .doc, .docx, .txt, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
                        type="file"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="my-2 text-muted-foreground text-sm">
                        File to upload
                      </p>
                      <div className="space-y-2">
                        {filesToUpload.map((fileUploadProgress) => {
                          return (
                            <div
                              key={fileUploadProgress.File.lastModified}
                              className="flex justify-between items-center gap-2 rounded-lg overflow-hidden border group"
                            >
                              <div className="flex items-center flex-1 p-2">
                                <div className="text-white">
                                  {getFileIconAndColor().icon}
                                </div>

                                <div className="w-full ml-2 space-y-1">
                                  <div className="text-sm flex justify-between">
                                    <p className="text-muted-foreground truncate">
                                      {fileUploadProgress.File.name.slice(
                                        0,
                                        50,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  if (fileUploadProgress.source)
                                    fileUploadProgress.source.cancel(
                                      'Upload cancelled',
                                    );
                                  removeFile(fileUploadProgress.File);
                                }}
                              >
                                <Icons.x className="size-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <UploadKnowledgeAdvancedSettingsCollapsableField form={form} />
            </Form.Content>
            <Form.Footer className="space-x-2 flex justify-end">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  variant="default"
                  loading={uploadStatus === 'loading'}
                  disabled={
                    !form.formState.isValid ||
                    filesToUpload.length === 0 ||
                    uploadStatus === 'loading'
                  }
                >
                  Upload
                </Button>
              </Dialog.Close>
            </Form.Footer>
          </>
        )}
      </form>
    </Form>
  );
}

export function UploadKnowledgeAdvancedSettingsCollapsableField({
  form,
  // knowledge,
}: {
  form: UseFormReturn & any;
  // knowledge: Knowledge;
}) {
  return (
    <Accordion type="single" collapsible>
      <Accordion.Item value="fields" className="border-b-0">
        <Accordion.Trigger>Advanced Configuration</Accordion.Trigger>
        <Accordion.Content>
          <div className="text-muted-foreground text-sm pb-4">
            When embedding text data, best practice is to chunk the data into
            smaller sizes and overlap the data slightly for each chunk. This
            will help AI use the data more effectively.
          </div>

          <Form.Field
            control={form.control}
            name="chunkSize"
            render={({ field }) => (
              <Form.Item className="p-1">
                <Form.Label>Chunk Size</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    type="number"
                    placeholder="add size"
                    onChange={(e) => {
                      form.setValue('chunkSize', Number(e.target.value));
                    }}
                    min={1}
                    max={2001}
                  />
                </Form.Control>
                <Form.Description>
                  Maximum of 2000 words per chunk
                </Form.Description>
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="chunkOverlap"
            render={({ field }) => (
              <Form.Item className="p-1">
                <Form.Label>Chunk Overlap</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    type="number"
                    placeholder="add overlap"
                    onChange={(e) => {
                      form.setValue('chunkOverlap', Number(e.target.value));
                    }}
                    min={1}
                    max={1000}
                  />
                </Form.Control>
                <Form.Description>
                  Maximum of 50% of the chunk size
                </Form.Description>
              </Form.Item>
            )}
          />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

const extractDataFromDocument = async (file: File) => {
  const fileType = file.type;

  let text: string;

  if (fileType === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (
    fileType === 'application/msword' ||
    fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    text = await extractTextFromDOC(file);
  } else if (fileType === 'text/plain') {
    text = await extractTextFromTextFile(file);
  } else {
    throw new Error('Unsupported file type');
  }

  if (text == null) {
    throw new Error('Failed to extract text from document');
  }

  return text;
};

async function extractTextFromPDF(file: File): Promise<string> {
  const text = await pdfToText(file);
  return text;
}

async function extractTextFromDOC(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}

async function extractTextFromTextFile(file: File): Promise<string> {
  const text = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  return text as string;
}

function SuccessFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.check className="w-12 h-12 text-success" />
          <Form.Title>Data Uploaded</Form.Title>
          <Form.Description>
            Your data is now in your knowledge notebook
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}

function ErrorFormContent() {
  return (
    <>
      <Form.Content>
        <div className="flex flex-col items-center space-y-2 pb-4 pt-8 ">
          <Icons.x className="w-12 h-12 text-error" />
          <Form.Title>Upload failed</Form.Title>
          <Form.Description className="text-center">
            Could not upload data. Please try again.
          </Form.Description>
        </div>
      </Form.Content>
      <Form.Footer className="space-x-2 flex justify-end">
        <Dialog.Close asChild>
          <Button variant="outline">Done</Button>
        </Dialog.Close>
      </Form.Footer>
    </>
  );
}
