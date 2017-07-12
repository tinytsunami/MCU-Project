#pragma once

namespace MCUProject {

	using namespace System;
	using namespace System::ComponentModel;
	using namespace System::Collections;
	using namespace System::Windows::Forms;
	using namespace System::Data;
	using namespace System::Drawing;

	/// <summary>
	/// MainForm ���K�n
	/// </summary>
	public ref class MainForm : public System::Windows::Forms::Form
	{
	public:
		MainForm(void)
		{
			InitializeComponent();
			//
			//TODO:  �b���[�J�غc�禡�{���X
			//
		}

	protected:
		/// <summary>
		/// �M������ϥΤ����귽�C
		/// </summary>
		~MainForm()
		{
			if (components)
			{
				delete components;
			}
		}
	private: System::Windows::Forms::OpenFileDialog^  openFileDialog1;
	private: System::Windows::Forms::Button^  button1;
	private: System::Windows::Forms::TextBox^  textBox1;
	protected:

	private:
		/// <summary>
		/// �]�p�u��һݪ��ܼơC
		/// </summary>
		System::ComponentModel::Container ^components;

#pragma region Windows Form Designer generated code
		/// <summary>
		/// �����]�p�u��䴩�һݪ���k - �ФŨϥε{���X�s�边�ק�
		/// �o�Ӥ�k�����e�C
		/// </summary>
		void InitializeComponent(void)
		{
			this->openFileDialog1 = (gcnew System::Windows::Forms::OpenFileDialog ());
			this->button1 = (gcnew System::Windows::Forms::Button ());
			this->textBox1 = (gcnew System::Windows::Forms::TextBox ());
			this->SuspendLayout ();
			// 
			// openFileDialog1
			// 
			this->openFileDialog1->FileName = L"openFileDialog1";
			// 
			// button1
			// 
			this->button1->Location = System::Drawing::Point (12, 14);
			this->button1->Name = L"button1";
			this->button1->Size = System::Drawing::Size (75, 23);
			this->button1->TabIndex = 0;
			this->button1->Text = L"Open MIDI";
			this->button1->UseVisualStyleBackColor = true;
			this->button1->Click += gcnew System::EventHandler (this, &MainForm::button1_Click);
			// 
			// textBox1
			// 
			this->textBox1->Location = System::Drawing::Point (93, 14);
			this->textBox1->Multiline = true;
			this->textBox1->Name = L"textBox1";
			this->textBox1->ReadOnly = true;
			this->textBox1->ScrollBars = System::Windows::Forms::ScrollBars::Vertical;
			this->textBox1->Size = System::Drawing::Size (418, 338);
			this->textBox1->TabIndex = 1;
			// 
			// MainForm
			// 
			this->AutoScaleDimensions = System::Drawing::SizeF (6, 12);
			this->AutoScaleMode = System::Windows::Forms::AutoScaleMode::Font;
			this->ClientSize = System::Drawing::Size (523, 364);
			this->Controls->Add (this->textBox1);
			this->Controls->Add (this->button1);
			this->Name = L"MainForm";
			this->Text = L"MainForm";
			this->Load += gcnew System::EventHandler (this, &MainForm::MainForm_Load);
			this->ResumeLayout (false);
			this->PerformLayout ();

		}
#pragma endregion
	private:
		array<Byte> ^buffer;
		void showText (String^ title, array<Byte>^ data, int start, int end) {
			String ^text;
			for (int i = start; i < end; i++)
				text += System::Convert::ToChar (data[i]);
			textBox1->AppendText (title + ": " + text + "\r\n");
		}

		void showInt (String^ title, array<Byte>^ data, int start, int end) {
			String ^text;
			array<Byte> ^tmp = gcnew array<Byte>(end - start);
			Array::Copy (data, start, tmp, 0, end - start);
			Array::Reverse (tmp);
			switch(tmp->Length) {
				case 2:
					text = System::Convert::ToString (System::BitConverter::ToUInt16 (tmp, 0));
					break;
				case 4:
					text = System::Convert::ToString (System::BitConverter::ToUInt32 (tmp, 0));
					break;
				case 8:
					text = System::Convert::ToString (System::BitConverter::ToUInt64 (tmp, 0));
					break;
				default:
					return;
			}
			textBox1->AppendText (title + ": " + text + "\r\n");
		}

		System::Void MainForm_Load (System::Object^  sender, System::EventArgs^  e) {
			openFileDialog1->InitialDirectory = "D:\\";
			openFileDialog1->Filter = "midi files (*.mid)|";
			openFileDialog1->FilterIndex = 0;
			openFileDialog1->RestoreDirectory = true;
		}

		System::Void button1_Click (System::Object^  sender, System::EventArgs^  e) {
			System::IO::Stream^ data;
			if (openFileDialog1->ShowDialog () == System::Windows::Forms::DialogResult::OK)
			{
				if ((data = openFileDialog1->OpenFile ()) != nullptr)
				{
					buffer = gcnew array<Byte> (data->Length);
					data->Read (buffer, 0, data->Length);
					//read head tag
					showText ("MIDI���Y�Х�", buffer, 0, 4);
					showInt ("MIDI���Y����", buffer, 4, 8);
					showInt ("MIDI�ɮ׮榡", buffer, 8, 10);
					showInt ("MIDI�y�D�ƶq", buffer, 10, 12);
					showInt ("MIDI�ɶ����", buffer, 12, 14);

					data->Close ();
				}
			}
		}
	};
}
