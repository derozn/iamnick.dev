import styled from 'styled-components';

export const Container = styled.article`
  position: relative;
  width: 100%;
`;

export const Image = styled.img`
  margin-top: 40px;
  max-width: 70%;
  width: 100%;
`;

export const Paragraph = styled.p`
  margin-top: 40px;
  max-width: 50%;
  width: 100%;
  color: ${({ theme }) => theme.palette.text.primary};
`;
