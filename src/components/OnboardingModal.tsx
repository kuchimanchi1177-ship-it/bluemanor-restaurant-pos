"use client";

import React from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInitial?: boolean;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  if (!isOpen) return null;
  return null;
}
