// components/FormPerguntasFrequentes.tsx
import { Modal, TextInput, Button, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { PerguntasFrequentes } from '~/lib/repositories/perguntasRepository';

interface FormPerguntasFrequentesProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: PerguntasFrequentes) => void;
  initialValues?: PerguntasFrequentes;
  existingData: PerguntasFrequentes[];
}

export function FormPerguntasFrequentes({
  opened,
  onClose,
  onSubmit,
  initialValues = { ordem: 0, question: '', response: '' },
  existingData,
}: FormPerguntasFrequentesProps) {
  const form = useForm<PerguntasFrequentes>({
    initialValues,
    validate: {
      ordem: (value) => {
        if (value === null || value === undefined) return 'Ordem é obrigatória';
        const isDuplicate = existingData.some((item) => item.ordem === value && item.id !== initialValues.id);
        if (isDuplicate) return 'Ordem já existe';
        return null;
      },
      question: (value) => (!value || value.trim().length < 5 ? 'Pergunta deve ter no mínimo 5 caracteres' : null),
      response: (value) => (!value || value.trim().length < 5 ? 'Resposta deve ter no mínimo 5 caracteres' : null),
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Pergunta Frequente">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput label="Ordem" type="number" {...form.getInputProps('ordem')} mb="sm" />
        <TextInput label="Pergunta" {...form.getInputProps('question')} mb="sm" />
        <Textarea label="Resposta" {...form.getInputProps('response')} mb="sm" minRows={4} />
        <Button type="submit">Salvar</Button>
      </form>
    </Modal>
  );
}
