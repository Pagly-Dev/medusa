import {
  createHook,
  createWorkflow,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { uploadFilesStep } from "../steps"

/**
 * The data to upload files.
 */
export type UploadFilesWorkflowInput = {
  /**
   * The files to upload.
   */
  files: {
    /**
     * The name of the file.
     */
    filename: string
    /**
     * The MIME type of the file.
     *
     * @example
     * img/jpg
     */
    mimeType: string
    /**
     * The content of the file. For images, for example,
     * use base64 string. For CSV files, use the CSV content.
     */
    content: string
    /**
     * The access level of the file. Use `public` for the file that
     * can be accessed by anyone. For example, for images that are displayed
     * on the storefront. Use `private` for files that are only accessible
     * by authenticated users. For example, for CSV files used to
     * import data.
     */
    access: "public" | "private"
  }[]
}

export const uploadFilesWorkflowId = "upload-files"
/**
 * This workflow uploads one or more files using the installed
 * [File Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/file). The workflow is used by the
 * [Upload Files Admin API Route](https://docs.medusajs.com/api/admin/uploads/upload-files).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * upload files within your custom flows.
 *
 * @example
 * const { result } = await uploadFilesWorkflow(container)
 * .run({
 *   input: {
 *     files: [
 *       {
 *         filename: "test.jpg",
 *         mimeType: "img/jpg",
 *         content: "base64-string",
 *         access: "public"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Upload files using the installed File Module Provider.
 *
 * @property hooks.filesUploaded - This hook is executed after the files are uploaded. You can consume this hook to record the uploaded files, for example in a media library.
 */
export const uploadFilesWorkflow = createWorkflow(
  uploadFilesWorkflowId,
  (input: WorkflowData<UploadFilesWorkflowInput>) => {
    const files = uploadFilesStep(input)
    // Pagly: lets a plugin record every upload (the media library) without core depending on it.
    const filesUploaded = createHook("filesUploaded", { files, input })

    return new WorkflowResponse(files, { hooks: [filesUploaded] })
  }
)
