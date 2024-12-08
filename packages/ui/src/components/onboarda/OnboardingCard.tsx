import confetti from 'canvas-confetti';
import React from 'react';

import useApiMutation from '@/api/use-api-mutation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { User } from '@/models/user-model';

import { Icons } from '../icons';

import { useOnborda } from './OnbordaContext';
import { CardComponentProps } from './types';

export const OnboardingCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  // Onborda hooks
  const { closeOnborda, currentTour } = useOnborda();
  const { setUser, workspaceUser } = useUser();
  const onboardMutation = useApiMutation({
    service: 'users',
    method: 'updateMe',
  });

  function handleConfetti() {
    closeOnborda();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    onboardMutation.mutateAsync(
      {
        data: {
          toursCompleted: [
            ...workspaceUser!.user!.toursCompleted,
            currentTour as User['toursCompleted'][number],
          ],
        },
      },
      {
        onSuccess: (user) => {
          setUser(user);
        },
      },
    );
  }

  return (
    <Card className="border-0 rounded-3xl max-w-vw w-96">
      <Card.Header>
        <div className="flex items-start justify-between w-full">
          <div>
            <Card.Title className="mb-2 text-lg">
              {step.icon} {step.title}
            </Card.Title>
            <Card.Description>
              {currentStep + 1} of {totalSteps}
            </Card.Description>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="space-x-2"
            onClick={() => handleConfetti()}
          >
            <span>Skip</span>
            <Icons.x className="size-4" />
          </Button>
        </div>
      </Card.Header>
      <Card.Content>{step.content}</Card.Content>
      <Card.Footer>
        <div className="flex justify-between w-full">
          {currentStep !== 0 && (
            <Button
              onClick={() => prevStep()}
              className="space-x-2"
              variant="outline"
            >
              <Icons.chevronLeft className="size-4" />
              <span>Previous</span>
            </Button>
          )}
          {currentStep + 1 !== totalSteps && (
            <Button
              onClick={() => nextStep()}
              className="ml-auto space-x-2"
              variant="outline"
            >
              <span>Next</span>
              <Icons.chevronRight className="size-4" />
            </Button>
          )}
          {currentStep + 1 === totalSteps && (
            <Button onClick={() => handleConfetti()} className="ml-auto">
              <span role="img" aria-label="Congratulations!">
                🎉 Finish!
              </span>
            </Button>
          )}
        </div>
      </Card.Footer>
      <span className="text-card">{arrow}</span>
    </Card>
  );
};
