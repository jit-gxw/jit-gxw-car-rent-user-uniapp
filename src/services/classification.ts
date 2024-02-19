import { http } from "@/utils/http"
import type { ClassificationType } from '@/types/classification'
/**
 * 获取分类信息
 * @returns 
 */
export const searchClassificationService = () => {
    return http<ClassificationType[]>({
        method: 'GET',
        url: '/user/classification/list'
    })
}


