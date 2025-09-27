"use client";

import { useI18n } from "@/providers/I18nProvider";

interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  sodium?: number;
  sugar?: number;
  fiber?: number;
  [key: string]: any;
}

interface ProductNutritionInfoProps {
  nutrition?: NutritionInfo | null;
  halalCertified: boolean;
  metadata?: Record<string, unknown> | null;
}

export function ProductNutritionInfo({ nutrition, halalCertified, metadata }: ProductNutritionInfoProps) {
  const { t } = useI18n();

  // 메타데이터에서 영양정보 추출
  const nutritionData = nutrition || (metadata?.nutrition as NutritionInfo) || {};
  const hasNutritionInfo = Object.keys(nutritionData).length > 0;

  const certifications = [];
  if (halalCertified) {
    certifications.push({
      name: "할랄 인증",
      icon: "🔰",
      color: "bg-green-100 text-green-800",
      description: "이슬람 율법에 따라 인증된 제품입니다"
    });
  }

  // 메타데이터에서 추가 인증 정보 확인
  if (metadata?.certifications) {
    const additionalCerts = metadata.certifications as any[];
    if (Array.isArray(additionalCerts)) {
      additionalCerts.forEach((cert: any) => {
        certifications.push({
          name: cert.name || cert,
          icon: cert.icon || "✅",
          color: cert.color || "bg-blue-100 text-blue-800",
          description: cert.description || ""
        });
      });
    }
  }

  if (!hasNutritionInfo && certifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 인증 배지들 */}
      {certifications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("productDetail.certifications", "인증 정보")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${cert.color} border`}
                title={cert.description}
              >
                <span className="text-lg">{cert.icon}</span>
                <span>{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 영양 정보 */}
      {hasNutritionInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("productDetail.nutritionInfo", "영양 정보")}
          </h3>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* 주요 영양소 */}
              {nutritionData.calories && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {nutritionData.calories}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("nutrition.calories", "칼로리")} (kcal)
                  </div>
                </div>
              )}

              {nutritionData.protein && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {nutritionData.protein}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("nutrition.protein", "단백질")}
                  </div>
                </div>
              )}

              {nutritionData.carbohydrates && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {nutritionData.carbohydrates}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("nutrition.carbohydrates", "탄수화물")}
                  </div>
                </div>
              )}

              {nutritionData.fat && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {nutritionData.fat}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("nutrition.fat", "지방")}
                  </div>
                </div>
              )}

              {nutritionData.sodium && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {nutritionData.sodium}mg
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("nutrition.sodium", "나트륨")}
                  </div>
                </div>
              )}

              {nutritionData.fiber && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {nutritionData.fiber}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t("nutrition.fiber", "식이섬유")}
                  </div>
                </div>
              )}
            </div>

            {/* 추가 영양 정보 */}
            {Object.keys(nutritionData).some(key => !['calories', 'protein', 'carbohydrates', 'fat', 'sodium', 'fiber'].includes(key)) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("nutrition.additional", "추가 정보")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(nutritionData)
                    .filter(([key]) => !['calories', 'protein', 'carbohydrates', 'fat', 'sodium', 'fiber'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300 capitalize">
                          {t(`nutrition.${key}`, key)}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {typeof value === 'number' ? `${value}${key.includes('vitamin') ? 'mg' : 'g'}` : value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 주의사항 */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                * {t("nutrition.disclaimer", "영양 성분은 제품마다 차이가 있을 수 있습니다.")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}