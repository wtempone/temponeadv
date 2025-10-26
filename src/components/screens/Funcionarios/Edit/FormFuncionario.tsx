// components/FormFuncionario.tsx
import { Modal, TextInput, Button, FileInput, Group, Loader, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Funcionario } from '~/lib/repositories/funcionariosRepository';
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';

interface FormFuncionarioProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Funcionario) => void;
  initialValues?: Funcionario;
  existingData: Funcionario[];
}

export function FormFuncionario({
  opened,
  onClose,
  onSubmit,
  initialValues = { name: '', description: '', fotoUrl: '' },
  existingData,
}: FormFuncionarioProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<Funcionario>({
    initialValues,
    validate: {
      name: (value) => (!value || value.trim().length < 3 ? 'Nome deve ter no mínimo 3 letras' : null),
      description: (value) => (!value || value.trim().length < 3 ? 'Descrição deve ter no mínimo 3 letras' : null),
    },
  });

  const handleSubmit = async (values: Funcionario) => {
    setUploading(true);
    let fotoUrl = values.fotoUrl;
    const storage = useStorage();

    // Se houver nova imagem
    if (file) {
      // Exclui imagem anterior se existir
      if (initialValues.fotoUrl && initialValues.fotoUrl.startsWith('https')) {
        try {
          const previousRef = ref(
            storage,
            decodeURIComponent(
              new URL(initialValues.fotoUrl).pathname.replace(/^\/v0\/b\/[^/]+\/o\//, '').replace(/\?.*$/, ''),
            ),
          );
          await deleteObject(previousRef);
        } catch (error) {
          console.warn('Erro ao excluir imagem anterior:', error);
        }
      }

      // Faz upload da nova imagem
      const storageRef = ref(storage, `funcionarios_image/${file.name}`);
      await uploadBytes(storageRef, file);
      fotoUrl = await getDownloadURL(storageRef);
    }

    setUploading(false);
    onSubmit({ ...values, fotoUrl });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Funcionário">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Nome" {...form.getInputProps('name')} mb="sm" />
        <TextInput label="Descrição" {...form.getInputProps('description')} mb="sm" />
        <FileInput
          label="Foto do Funcionário"
          placeholder="Selecione uma imagem"
          accept="image/*"
          onChange={setFile}
          mb="sm"
        />
        {uploading ? (
          <Center>
            <Group mt="md">
              <Loader />
            </Group>
          </Center>
        ) : (
          <Button type="submit">Salvar</Button>
        )}
      </form>
    </Modal>
  );
}
