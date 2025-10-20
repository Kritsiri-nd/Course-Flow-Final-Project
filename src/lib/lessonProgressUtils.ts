/**
 * ฟังก์ชันคำนวณ progress ของบทเรียน
 * เขียนแบบง่ายๆ ให้ junior dev อ่านเข้าใจได้
 */

// ====== ประเภทข้อมูล ======
export type LessonStatus = "completed" | "in_progress" | "not_started";

// ====== ฟังก์ชันหลักสำหรับคำนวณ progress ======

/**
 * ตรวจสอบว่าบทเรียนจบแล้วหรือยัง
 * เกณฑ์: ต้อง seek ใกล้ท้าย + ดูจริงครบตามเกณฑ์
 */
export function isLessonCompleted(
    currentPosition: number,
    watchedTime: number,
    videoDuration: number
): boolean {
    if (!videoDuration || videoDuration <= 0) {
        return false;
    }

    // ต้อง seek ไปถึง 90% ของวิดีโอ
    const positionThreshold = Math.max(videoDuration * 0.9, videoDuration - 5);
    const reachedEnd = currentPosition >= positionThreshold;

    // ต้องดูจริงครบตามเกณฑ์ (ขึ้นอยู่กับความยาววิดีโอ)
    const watchTimeThreshold = calculateWatchTimeThreshold(videoDuration, watchedTime);
    const watchedEnough = watchedTime >= watchTimeThreshold;

    return reachedEnd && watchedEnough;
}

/**
 * คำนวณว่าต้องดูวิดีโอกี่วินาทีถึงจะถือว่าจบ
 * วิดีโอสั้นใช้เกณฑ์ผ่อนปรน วิดีโอยาวใช้เกณฑ์เข้มงวดขึ้น
 */
function calculateWatchTimeThreshold(
    videoDuration: number,
    currentWatchedTime: number
): number {
    // วิดีโอสั้นมาก (≤30 วินาที) - ผ่อนปรนมาก
    if (videoDuration <= 30) {
        return Math.max(videoDuration * 0.2, 5); // ดูอย่างน้อย 20% หรือ 5 วินาที
    }

    // วิดีโอสั้น (30 วินาที - 2 นาที)
    if (videoDuration <= 120) {
        if (currentWatchedTime >= videoDuration * 0.6) {
            return videoDuration * 0.25; // ดูอย่างน้อย 25%
        }
        return videoDuration * 0.4; // ดูอย่างน้อย 40%
    }

    // วิดีโอกลาง (2-10 นาที)
    if (videoDuration <= 600) {
        if (currentWatchedTime >= videoDuration * 0.5) {
            return videoDuration * 0.3; // ดูอย่างน้อย 30%
        }
        return videoDuration * 0.45; // ดูอย่างน้อย 45%
    }

    // วิดีโอยาว (>10 นาที) - เข้มงวดสุด
    if (currentWatchedTime >= videoDuration * 0.4) {
        return videoDuration * 0.35; // ดูอย่างน้อย 35%
    }
    return videoDuration * 0.5; // ดูอย่างน้อย 50%
}

/**
 * คำนวณ progress percentage ที่แม่นยำ
 * ใช้ทั้งตำแหน่งที่ seek ไปและเวลาที่ดูจริง
 * เพื่อป้องกันการ skip ไปจบแล้วแสดง 100%
 */
export function calculateProgressPercent(
    currentPosition: number,
    watchedTime: number,
    videoDuration: number
): number {
    if (!videoDuration || videoDuration <= 0) {
        return 0;
    }

    // คำนวณ % จากตำแหน่งที่ seek ไป
    const positionPercent = currentPosition / videoDuration;

    // คำนวณ % จากเวลาที่ดูจริง (คูณ 1.5 เพราะคนอาจจะดูเร็ว x2)
    const watchedPercent = watchedTime / videoDuration;

    // เอาค่าที่น้อยกว่า = ถ้า skip มากจะได้ % ต่ำกว่า
    const percent = Math.min(positionPercent, watchedPercent * 1.5);

    // จำกัดให้อยู่ในช่วง 0-100%
    return Math.min(100, Math.max(0, percent * 100));
}

/**
 * แปลงสถานะเป็น string เพื่อความชัดเจน
 */
export function getLessonStatus(
    hasProgress: boolean,
    isCompleted: boolean,
    watchedTime: number
): LessonStatus {
    if (isCompleted) {
        return "completed";
    }

    if (hasProgress && watchedTime > 0) {
        return "in_progress";
    }

    return "not_started";
}

/**
 * ตรวจสอบว่าผู้ใช้เคยเข้าหน้าบทเรียนนี้หรือยัง
 * ดูจาก last_position_seconds > 0 หรือมี record ใน lesson_progress
 */
export function hasVisitedLesson(progressData: any): boolean {
    if (!progressData) return false;

    // ถ้ามี last_position_seconds แสดงว่าเคยเข้าหน้า
    return Number(progressData.last_position_seconds || 0) > 0;
}

/**
 * คำนวณตำแหน่ง resume ที่เหมาะสม
 * ถ้า user skip ไปจบแต่ดูจริงยังไม่พอ จะ adjust ให้ resume จากตำแหน่งที่เหมาะสม
 */
export function calculateResumePosition(
    lastPosition: number,
    watchedTime: number,
    videoDuration: number,
    isCompleted: boolean
): number {
    // ถ้าจบแล้ว ให้ resume จากจุดที่บันทึกไว้ตามปกติ
    if (isCompleted) {
        return lastPosition;
    }

    // ถ้ายังไม่จบ ตรวจสอบว่าตำแหน่งสมเหตุสมผลหรือไม่
    const positionThreshold = Math.max(videoDuration * 0.9, videoDuration - 5);
    const isNearEnd = lastPosition >= positionThreshold;
    const hasLowWatchTime = watchedTime < videoDuration * 0.3;

    // ถ้าตำแหน่งอยู่ใกล้ท้ายแต่ดูจริงยังน้อย = น่าจะ skip
    // ให้ resume จากตำแหน่งที่สมเหตุสมผลแทน
    if (isNearEnd && hasLowWatchTime) {
        // ประมาณ 2x ของเวลาที่ดูจริง แต่ไม่เกิน 90%
        const adjustedPosition = Math.min(watchedTime * 2, videoDuration * 0.9);
        console.log(
            `Adjusted resume: ${lastPosition}s → ${adjustedPosition}s (watched: ${watchedTime}s)`
        );
        return adjustedPosition;
    }

    return lastPosition;
}

/**
 * จำกัด watch time ไม่ให้สูงเกินไป
 * ป้องกันข้อมูลผิดพลาดและ integer overflow
 */
export function capWatchTime(
    existingWatchTime: number,
    videoDuration: number | null
): number {
    // กำหนดค่าสูงสุดตามความยาววิดีโอ
    const maxAllowed = videoDuration ? videoDuration * 5 : 1800; // 5x หรือ 30 นาที

    return Math.min(existingWatchTime, maxAllowed);
}