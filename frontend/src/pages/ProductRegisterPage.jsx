import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchCategories } from '../store/categorySlice';
import { createProduct } from '../api/productApi';
import {
  Container, Button, Input, TextArea, Select,
  FormGroup, Label, ErrorText, Card, SectionTitle
} from '../styles/CommonStyles';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

function ProductRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((state) => state.category);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    itemCondition: 'GOOD',
    startPrice: '',
    buyNowPrice: '',
    auctionDays: '3',
    deliveryType: 'PARCEL',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다');
      navigate('/login');
    }
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, isAuthenticated, navigate, categories.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  /** 이미지 선택 처리 */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      alert('이미지는 최대 5장까지 등록 가능합니다');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // 미리보기 생성
    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  /** 이미지 삭제 */
  const handleImageRemove = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  /** 유효성 검사 */
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = '상품명을 입력하세요';
    if (!form.description.trim()) newErrors.description = '상품 설명을 입력하세요';
    if (!form.categoryId) newErrors.categoryId = '카테고리를 선택하세요';
    if (!form.startPrice || Number(form.startPrice) < 1000)
      newErrors.startPrice = '시작가는 1,000원 이상이어야 합니다';
    if (form.buyNowPrice && Number(form.buyNowPrice) <= Number(form.startPrice))
      newErrors.buyNowPrice = '즉시구매가는 시작가보다 높아야 합니다';
    if (imageFiles.length === 0) newErrors.images = '이미지를 1장 이상 등록하세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** 등록 제출 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const productData = {
        title: form.title,
        description: form.description,
        categoryId: Number(form.categoryId),
        itemCondition: form.itemCondition,
        startPrice: Number(form.startPrice),
        buyNowPrice: form.buyNowPrice ? Number(form.buyNowPrice) : null,
        auctionDays: Number(form.auctionDays),
        deliveryType: form.deliveryType,
      };

      const response = await createProduct(productData, imageFiles);
      const newId = response.data.data.id;
      alert('상품이 등록되었습니다!');
      navigate(`/products/${newId}`);
    } catch (error) {
      alert(error.response?.data?.message || '상품 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  // 중분류 카테고리 펼치기
  const subCategories = form.categoryId
    ? []
    : categories.flatMap(cat => cat.children || []);

  return (
    <PageWrapper>
      <Container>
        <FormCard>
          <SectionTitle>상품 등록</SectionTitle>

          <form onSubmit={handleSubmit}>
            {/* 이미지 업로드 */}
            <FormGroup>
              <Label>상품 이미지 * (최대 5장, 첫 번째가 대표 이미지)</Label>
              <ImageUploadArea>
                {imagePreviews.map((preview, i) => (
                  <PreviewItem key={i}>
                    <PreviewImg src={preview} alt="" />
                    {i === 0 && <ThumbBadge>대표</ThumbBadge>}
                    <RemoveBtn type="button" onClick={() => handleImageRemove(i)}>
                      <FiX size={14} />
                    </RemoveBtn>
                  </PreviewItem>
                ))}
                {imageFiles.length < 5 && (
                  <UploadBtn as="label">
                    <FiUpload size={24} />
                    <span>사진 추가</span>
                    <HiddenInput
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </UploadBtn>
                )}
              </ImageUploadArea>
              {errors.images && <ErrorText>{errors.images}</ErrorText>}
            </FormGroup>

            {/* 상품명 */}
            <FormGroup>
              <Label>상품명 *</Label>
              <Input
                name="title"
                placeholder="상품명을 입력하세요"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
              />
              {errors.title && <ErrorText>{errors.title}</ErrorText>}
            </FormGroup>

            {/* 카테고리 */}
            <FormGroup>
              <Label>카테고리 *</Label>
              <Select name="categoryId" value={form.categoryId} onChange={handleChange}>
                <option value="">카테고리를 선택하세요</option>
                {categories.map((parent) => (
                  <optgroup key={parent.id} label={parent.name}>
                    {parent.children?.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              {errors.categoryId && <ErrorText>{errors.categoryId}</ErrorText>}
            </FormGroup>

            {/* 상품 설명 */}
            <FormGroup>
              <Label>상품 설명 *</Label>
              <TextArea
                name="description"
                placeholder="상품의 상태, 구매 시기, 사용 기간 등을 자세히 입력하세요"
                value={form.description}
                onChange={handleChange}
                rows={8}
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FormGroup>

            {/* 상품 상태 + 배송방법 */}
            <TwoCol>
              <FormGroup>
                <Label>상품 상태 *</Label>
                <Select name="itemCondition" value={form.itemCondition} onChange={handleChange}>
                  <option value="BEST">최상 (거의 새 제품)</option>
                  <option value="GOOD">양호 (사용감 있음)</option>
                  <option value="FAIR">보통 (하자 있음)</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>배송 방법 *</Label>
                <Select name="deliveryType" value={form.deliveryType} onChange={handleChange}>
                  <option value="PARCEL">택배</option>
                  <option value="DIRECT">직거래</option>
                  <option value="BOTH">택배 / 직거래</option>
                </Select>
              </FormGroup>
            </TwoCol>

            {/* 가격 + 경매기간 */}
            <TwoCol>
              <FormGroup>
                <Label>시작가 *</Label>
                <Input
                  name="startPrice"
                  type="number"
                  placeholder="최소 1,000원"
                  value={form.startPrice}
                  onChange={handleChange}
                  min={1000}
                  step={1000}
                />
                {errors.startPrice && <ErrorText>{errors.startPrice}</ErrorText>}
              </FormGroup>
              <FormGroup>
                <Label>즉시구매가 (선택)</Label>
                <Input
                  name="buyNowPrice"
                  type="number"
                  placeholder="미입력 시 즉시구매 불가"
                  value={form.buyNowPrice}
                  onChange={handleChange}
                  step={1000}
                />
                {errors.buyNowPrice && <ErrorText>{errors.buyNowPrice}</ErrorText>}
              </FormGroup>
            </TwoCol>

            <FormGroup>
              <Label>경매 기간 *</Label>
              <Select name="auctionDays" value={form.auctionDays} onChange={handleChange}>
                <option value="1">1일</option>
                <option value="3">3일</option>
                <option value="5">5일</option>
                <option value="7">7일</option>
              </Select>
            </FormGroup>

            <BtnRow>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                취소
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? '등록 중...' : '상품 등록'}
              </Button>
            </BtnRow>
          </form>
        </FormCard>
      </Container>
    </PageWrapper>
  );
}

export default ProductRegisterPage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 30px 0 60px;
`;

const FormCard = styled(Card)`
  max-width: 720px;
  margin: 0 auto;
  padding: 36px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const ImageUploadArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbBadge = styled.span`
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  background: var(--primary);
  color: white;
  border-radius: 4px;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  transition: background 0.2s;
  &:hover { background: var(--danger); }
`;

const UploadBtn = styled.div`
  width: 110px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
`;
