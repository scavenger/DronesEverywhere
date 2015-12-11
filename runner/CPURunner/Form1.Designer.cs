namespace CPURunner
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.tbConsole = new System.Windows.Forms.TextBox();
            this.btnLoadIt = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // tbConsole
            // 
            this.tbConsole.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbConsole.Font = new System.Drawing.Font("Consolas", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbConsole.Location = new System.Drawing.Point(9, 12);
            this.tbConsole.Multiline = true;
            this.tbConsole.Name = "tbConsole";
            this.tbConsole.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.tbConsole.Size = new System.Drawing.Size(938, 547);
            this.tbConsole.TabIndex = 0;
            // 
            // btnLoadIt
            // 
            this.btnLoadIt.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.btnLoadIt.Location = new System.Drawing.Point(25, 570);
            this.btnLoadIt.Name = "btnLoadIt";
            this.btnLoadIt.Size = new System.Drawing.Size(75, 23);
            this.btnLoadIt.TabIndex = 1;
            this.btnLoadIt.Text = "Load";
            this.btnLoadIt.UseVisualStyleBackColor = true;
            this.btnLoadIt.Click += new System.EventHandler(this.btnLoadIt_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(959, 605);
            this.Controls.Add(this.btnLoadIt);
            this.Controls.Add(this.tbConsole);
            this.Name = "Form1";
            this.Text = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox tbConsole;
        private System.Windows.Forms.Button btnLoadIt;
    }
}

